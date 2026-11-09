import { useEffect, useState } from "react";
import { View } from "react-native";
import { useAdjustInventory } from "../../../hooks/useInventoryAdjustment";
import { useTheme } from "../../../hooks/useTheme";
import { useToast } from "../../../hooks/useToast";
import { InventoryMovementType } from "../../../types/seller";
import { AppText } from "../../../components/AppText";
import { Chip } from "../../../components/Chip";
import { Input } from "../../../components/Input";
import { FilterSheet } from "../../../components/FilterSheet";
import { ConfirmSheet } from "../../../components/ConfirmSheet";

interface AdjustStockSheetProps {
  visible: boolean;
  bookId: string;
  bookTitle: string;
  currentStock: number;
  onClose: () => void;
}

// A reduction removing at least this share of current stock gets an extra
// confirmation step — a UX gate only; the backend just rejects reductions
// that would go below zero, regardless of magnitude.
const LARGE_REDUCTION_RATIO = 0.5;

const MOVEMENT_TYPES: Array<{
  type: InventoryMovementType;
  label: string;
  sign: 1 | -1 | 0;
}> = [
  { type: "RESTOCK", label: "Restock", sign: 1 },
  { type: "RETURN", label: "Return", sign: 1 },
  { type: "DAMAGE", label: "Damage", sign: -1 },
  { type: "MANUAL_REDUCTION", label: "Manual reduction", sign: -1 },
  { type: "CORRECTION", label: "Correction", sign: 0 },
];

export function AdjustStockSheet({
  visible,
  bookId,
  bookTitle,
  currentStock,
  onClose,
}: AdjustStockSheetProps) {
  const theme = useTheme();
  const toast = useToast();
  const adjust = useAdjustInventory();

  const [type, setType] = useState<InventoryMovementType>("RESTOCK");
  const [correctionSign, setCorrectionSign] = useState<1 | -1>(1);
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [confirmingLargeReduction, setConfirmingLargeReduction] =
    useState(false);

  useEffect(() => {
    if (visible) {
      setType("RESTOCK");
      setCorrectionSign(1);
      setQuantity("");
      setReason("");
    }
  }, [visible]);

  const activeType = MOVEMENT_TYPES.find((m) => m.type === type)!;
  const sign = activeType.sign === 0 ? correctionSign : activeType.sign;
  const parsedQuantity = Number(quantity);
  const hasValidQuantity =
    quantity.trim() !== "" &&
    Number.isFinite(parsedQuantity) &&
    parsedQuantity > 0;
  const quantityDelta = hasValidQuantity
    ? sign * Math.trunc(parsedQuantity)
    : 0;
  const resultingStock = currentStock + quantityDelta;
  const canSubmit =
    hasValidQuantity && reason.trim().length > 0 && resultingStock >= 0;

  const isLargeReduction =
    quantityDelta < 0 &&
    currentStock > 0 &&
    -quantityDelta / currentStock >= LARGE_REDUCTION_RATIO;

  const submit = () => {
    adjust.mutate(
      { bookId, payload: { type, quantityDelta, reason: reason.trim() } },
      {
        onSuccess: () => {
          toast("Stock adjusted");
          onClose();
        },
        onError: () => toast("Could not adjust stock"),
      },
    );
  };

  const handleApply = () => {
    if (!canSubmit) return;
    if (isLargeReduction) {
      setConfirmingLargeReduction(true);
      return;
    }
    submit();
  };

  return (
    <>
      <FilterSheet
        visible={visible}
        title="Adjust stock"
        onClose={onClose}
        onApply={handleApply}
        resultLabel={
          hasValidQuantity
            ? `Confirm — new stock ${Math.max(resultingStock, 0)}`
            : "Confirm"
        }
      >
        <View style={{ gap: theme.spacing.xs }}>
          <AppText
            variant="label"
            style={{ color: theme.colors.textSecondary }}
          >
            {bookTitle}
          </AppText>
          <AppText variant="body" style={{ color: theme.colors.textTertiary }}>
            Current stock: {currentStock}
          </AppText>
        </View>

        <View style={{ gap: theme.spacing.sm }}>
          <AppText
            variant="label"
            weight="semiBold"
            style={{ color: theme.colors.textSecondary }}
          >
            Adjustment type
          </AppText>
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: theme.spacing.sm,
            }}
          >
            {MOVEMENT_TYPES.map((m) => (
              <Chip
                key={m.type}
                variant="seller"
                label={m.label}
                selected={type === m.type}
                onPress={() => setType(m.type)}
              />
            ))}
          </View>
        </View>

        {activeType.sign === 0 ? (
          <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
            <Chip
              variant="seller"
              label="Increase"
              selected={correctionSign === 1}
              onPress={() => setCorrectionSign(1)}
            />
            <Chip
              variant="seller"
              label="Decrease"
              selected={correctionSign === -1}
              onPress={() => setCorrectionSign(-1)}
            />
          </View>
        ) : null}

        <Input
          label="Quantity"
          placeholder="Number of copies"
          keyboardType="numeric"
          value={quantity}
          onChangeText={setQuantity}
        />

        <Input
          label="Reason"
          placeholder="Why is this adjustment being made?"
          value={reason}
          onChangeText={setReason}
          multiline
        />

        {hasValidQuantity ? (
          <AppText
            variant="bodyMedium"
            style={{
              color:
                resultingStock < 0
                  ? theme.colors.error
                  : theme.colors.textPrimary,
            }}
          >
            New stock:{" "}
            {resultingStock < 0
              ? `${resultingStock} (not allowed)`
              : resultingStock}
          </AppText>
        ) : null}
      </FilterSheet>

      <ConfirmSheet
        visible={confirmingLargeReduction}
        title="Large reduction"
        message={`This will reduce stock by ${Math.abs(quantityDelta)} of ${currentStock} units (${currentStock} → ${resultingStock}). Are you sure?`}
        confirmLabel="Yes, adjust stock"
        destructive
        isConfirming={adjust.isPending}
        onConfirm={() => {
          setConfirmingLargeReduction(false);
          submit();
        }}
        onCancel={() => setConfirmingLargeReduction(false)}
      />
    </>
  );
}
