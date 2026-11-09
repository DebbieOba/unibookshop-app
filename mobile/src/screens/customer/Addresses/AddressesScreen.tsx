import { useState } from "react";
import { ScrollView, View, Pressable } from "react-native";
import * as Location from "expo-location";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CustomerStackParamList } from "../../../navigation/types";
import { useTheme } from "../../../hooks/useTheme";
import {
  useAddresses,
  useAddAddress,
  useUpdateAddress,
  useDeleteAddress,
  useSetDefaultAddress,
} from "../../../hooks/useAddresses";
import { Address } from "../../../types/user";
import { useToast } from "../../../hooks/useToast";
import { AppText } from "../../../components/AppText";
import { Button } from "../../../components/Button";
import { Card } from "../../../components/Card";
import { Input } from "../../../components/Input";
import { IconButton } from "../../../components/IconButton";
import { ConfirmSheet } from "../../../components/ConfirmSheet";
import { EmptyState } from "../../../components/EmptyState";
import { Skeleton } from "../../../components/Skeleton";
import { Ionicons } from "@expo/vector-icons";

type Props = NativeStackScreenProps<CustomerStackParamList, "Addresses">;

interface AddressFormState {
  label: string;
  street: string;
  city: string;
  state: string;
}

const EMPTY_FORM: AddressFormState = {
  label: "",
  street: "",
  city: "",
  state: "",
};

function AddressForm({
  value,
  onChange,
  onLocateMe,
  isLocating,
}: {
  value: AddressFormState;
  onChange: (next: AddressFormState) => void;
  onLocateMe: () => void;
  isLocating: boolean;
}) {
  return (
    <View style={{ gap: 12 }}>
      <Input
        label="Label (optional)"
        placeholder="e.g. Hostel, Home, Office"
        value={value.label}
        onChangeText={(label) => onChange({ ...value, label })}
      />
      <Input
        label="Street"
        placeholder="Street address"
        value={value.street}
        onChangeText={(street) => onChange({ ...value, street })}
      />
      <Input
        label="City"
        placeholder="City"
        value={value.city}
        onChangeText={(city) => onChange({ ...value, city })}
      />
      <Input
        label="State"
        placeholder="State"
        value={value.state}
        onChangeText={(state) => onChange({ ...value, state })}
      />
      <Button
        label="Use Current Location"
        variant="text"
        icon="pin-outline"
        isLoading={isLocating}
        loadingLabel="Locating…"
        onPress={onLocateMe}
        style={{ alignSelf: "flex-start", paddingVertical: 4 }}
      />
    </View>
  );
}

function AddressRow({
  address,
  onEdit,
  onDeleteRequest,
}: {
  address: Address;
  onEdit: () => void;
  onDeleteRequest: () => void;
}) {
  const theme = useTheme();
  const setDefaultAddress = useSetDefaultAddress();

  const isHostel =
    address.label?.toLowerCase().includes("hostel") ||
    address.label?.toLowerCase().includes("school");
  const isWork =
    address.label?.toLowerCase().includes("work") ||
    address.label?.toLowerCase().includes("office");
  const iconName = isHostel
    ? "school-outline"
    : isWork
      ? "business-outline"
      : "home-outline";

  return (
    <Card style={{ gap: theme.spacing.sm, padding: theme.spacing.md }}>
      <View
        style={{
          flexDirection: "row",
          gap: theme.spacing.sm,
          alignItems: "flex-start",
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: theme.colors.primary + "10",
            alignItems: "center",
            justifyContent: "center",
            marginTop: 2,
          }}
        >
          <Ionicons name={iconName} size={18} color={theme.colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <AppText variant="bodyMedium" weight="bold">
            {address.label || "Saved Address"}
          </AppText>
          <AppText
            variant="caption"
            style={{ color: theme.colors.textSecondary, marginTop: 2 }}
          >
            {address.street}, {address.city}, {address.state}
          </AppText>
          {address.isDefault ? (
            <View
              style={{
                alignSelf: "flex-start",
                backgroundColor: theme.colors.primary + "15",
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
                marginTop: theme.spacing.xs,
              }}
            >
              <AppText
                variant="caption"
                weight="bold"
                style={{ color: theme.colors.primary, fontSize: 9 }}
              >
                Default Delivery Address
              </AppText>
            </View>
          ) : null}
        </View>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {!address.isDefault ? (
            <IconButton
              name="star-outline"
              size={16}
              onPress={() => setDefaultAddress.mutate(address.id)}
            />
          ) : null}
          <IconButton name="pencil-outline" size={16} onPress={onEdit} />
          <IconButton
            name="trash-outline"
            size={16}
            color={theme.colors.error}
            onPress={onDeleteRequest}
          />
        </View>
      </View>
    </Card>
  );
}

export function AddressesScreen({ navigation }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const addresses = useAddresses();
  const addAddress = useAddAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<AddressFormState>(EMPTY_FORM);
  const [addingNew, setAddingNew] = useState(false);
  const [newForm, setNewForm] = useState<AddressFormState>(EMPTY_FORM);
  const [deletingAddress, setDeletingAddress] = useState<Address | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const confirmDelete = () => {
    if (!deletingAddress) return;
    deleteAddress.mutate(deletingAddress.id, {
      onSuccess: () => toast("Address removed"),
    });
    setDeletingAddress(null);
  };

  const startEdit = (address: Address) => {
    setEditingId(address.id);
    setEditForm({
      label: address.label ?? "",
      street: address.street,
      city: address.city,
      state: address.state,
    });
  };

  const handleLocateMe = async (isEdit: boolean) => {
    setIsLocating(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        toast(
          "Location permission denied — enter your address manually",
          "error",
        );
        return;
      }

      const position = await Location.getCurrentPositionAsync();
      const [place] = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      if (!place) {
        toast("Couldn't determine your address from this location", "error");
        return;
      }

      const street =
        [place.streetNumber, place.street].filter(Boolean).join(" ") ||
        place.name ||
        "";
      const located = {
        label: "",
        street,
        city: place.city || place.subregion || "",
        state: place.region || "",
      };

      if (isEdit) {
        setEditForm(located);
      } else {
        setNewForm(located);
      }
      toast("Location found — review and adjust if needed");
    } catch {
      toast(
        "Could not get your current location. Enter it manually instead.",
        "error",
      );
    } finally {
      setIsLocating(false);
    }
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await updateAddress.mutateAsync({
      id: editingId,
      payload: {
        label: editForm.label || undefined,
        street: editForm.street,
        city: editForm.city,
        state: editForm.state,
      },
    });
    setEditingId(null);
    toast("Address updated");
  };

  const saveNew = async () => {
    if (!newForm.street || !newForm.city || !newForm.state) return;
    await addAddress.mutateAsync({
      label: newForm.label || undefined,
      street: newForm.street,
      city: newForm.city,
      state: newForm.state,
    });
    setNewForm(EMPTY_FORM);
    setAddingNew(false);
    toast("Address added");
  };

  if (addresses.isLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background,
          padding: theme.spacing.lg,
          paddingTop: insets.top + theme.spacing.md,
        }}
      >
        <Skeleton height={200} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.lg,
          paddingTop: insets.top + theme.spacing.md,
          gap: theme.spacing.md,
          paddingBottom: 60,
        }}
      >
        {/* Save Address Title area with no top plain text and arrow header */}
        <View style={{ marginBottom: theme.spacing.sm }}>
          <AppText variant="title">Delivery Addresses</AppText>
          <AppText
            variant="caption"
            style={{ color: theme.colors.textSecondary }}
          >
            Configure drop-off hostels and campus lockers
          </AppText>
        </View>

        {(addresses.data ?? []).length === 0 && !addingNew ? (
          <EmptyState
            icon="location-outline"
            message="No addresses saved yet."
            subtext="Add one so deliveries know where to go."
          />
        ) : null}

        {(addresses.data ?? []).map((address) =>
          editingId === address.id ? (
            <Card key={address.id} style={{ gap: theme.spacing.sm }}>
              <AddressForm
                value={editForm}
                onChange={setEditForm}
                onLocateMe={() => handleLocateMe(true)}
                isLocating={isLocating}
              />
              <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <Button
                    label="Cancel"
                    variant="outline"
                    onPress={() => setEditingId(null)}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    label="Save"
                    isLoading={updateAddress.isPending}
                    loadingLabel="Saving…"
                    onPress={saveEdit}
                  />
                </View>
              </View>
            </Card>
          ) : (
            <AddressRow
              key={address.id}
              address={address}
              onEdit={() => startEdit(address)}
              onDeleteRequest={() => setDeletingAddress(address)}
            />
          ),
        )}

        {addingNew ? (
          <Card style={{ gap: theme.spacing.sm }}>
            <AddressForm
              value={newForm}
              onChange={setNewForm}
              onLocateMe={() => handleLocateMe(false)}
              isLocating={isLocating}
            />
            <View style={{ flexDirection: "row", gap: theme.spacing.sm }}>
              <View style={{ flex: 1 }}>
                <Button
                  label="Cancel"
                  variant="outline"
                  onPress={() => setAddingNew(false)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  label="Add"
                  isLoading={addAddress.isPending}
                  loadingLabel="Adding…"
                  onPress={saveNew}
                />
              </View>
            </View>
          </Card>
        ) : (
          <View
            style={{
              flexDirection: "row",
              gap: theme.spacing.sm,
              marginTop: theme.spacing.sm,
            }}
          >
            <Button
              style={{ flex: 1 }}
              label="Back"
              variant="outline"
              onPress={() => navigation.goBack()}
            />
            <Button
              style={{ flex: 2 }}
              label="Add New Address"
              icon="add-circle-outline"
              onPress={() => setAddingNew(true)}
            />
          </View>
        )}

        <ConfirmSheet
          visible={!!deletingAddress}
          title="Remove this address?"
          message={
            deletingAddress
              ? `"${deletingAddress.label || deletingAddress.street}" will be removed from your saved addresses.`
              : ""
          }
          confirmLabel="Remove"
          destructive
          isConfirming={deleteAddress.isPending}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingAddress(null)}
        />
      </ScrollView>
    </View>
  );
}
