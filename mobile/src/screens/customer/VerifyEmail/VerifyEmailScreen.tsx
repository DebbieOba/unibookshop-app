import { useEffect, useRef, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Platform,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useMutation } from "@tanstack/react-query";
import { Ionicons } from "@expo/vector-icons";
import { AuthStackParamList } from "../../../navigation/types";
import { useTheme } from "../../../hooks/useTheme";
import { useAuthStore } from "../../../store/authStore";
import { authApi } from "../../../api/auth.api";
import { secureStorage } from "../../../lib/secureStorage";
import { registerPushToken } from "../../../lib/push";
import { AppText } from "../../../components/AppText";
import { Button } from "../../../components/Button";
import { AuthBackdrop } from "../../../components/AuthBackdrop";
import { getErrorMessage } from "../../../lib/apiError";

type Props = NativeStackScreenProps<AuthStackParamList, "VerifyEmail">;

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export function VerifyEmailScreen({ route, navigation }: Props) {
  const { email, purpose, password } = route.params;
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setSession = useAuthStore((s) => s.setSession);
  const setNeedsOnboarding = useAuthStore((s) => s.setNeedsOnboarding);

  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sendOtp = useMutation({
    mutationFn: () => authApi.sendOtp(email, purpose),
  });

  const verifyOtp = useMutation({
    mutationFn: (fullCode: string) =>
      authApi.verifyOtp(email, fullCode, purpose),
    onSuccess: async (res) => {
      const data = res.data as any;

      if (purpose === "sign-in" && data.accessToken && data.refreshToken) {
        // sign-in OTP flow: tokens returned directly
        await secureStorage.setRefreshToken(data.refreshToken);
        setAccessToken(data.accessToken);
        const { data: user } = await authApi.me();
        setSession(data.accessToken, user);
        void registerPushToken();
      } else if (purpose === "verify-email" && password) {
        // sign-up flow: email verified → now log in with stored credentials
        const { data: tokens } = await authApi.login(email, password);
        await secureStorage.setRefreshToken(tokens.refreshToken);
        setAccessToken(tokens.accessToken);
        const { data: user } = await authApi.me();
        setSession(tokens.accessToken, user);
        setNeedsOnboarding(true); // take user to profile completion screen
        void registerPushToken();
      } else {
        // fallback: go back to login
        navigation.navigate("Login");
      }
    },
  });

  // Send OTP immediately when screen mounts
  useEffect(() => {
    handleSend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function startCooldown() {
    setCooldown(RESEND_COOLDOWN);
    cooldownRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          clearInterval(cooldownRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }

  function handleSend() {
    sendOtp.mutate(undefined, { onSuccess: startCooldown });
  }

  function handleChange(text: string, index: number) {
    // Allow only digits
    const digit = text.replace(/[^0-9]/g, "").slice(-1);
    const next = [...code];
    next[index] = digit;
    setCode(next);

    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }

    // Auto-submit when all digits filled
    const fullCode = next.join("");
    if (fullCode.length === CODE_LENGTH && !next.includes("")) {
      verifyOtp.mutate(fullCode);
    }
  }

  function handleKeyPress(e: any, index: number) {
    if (e.nativeEvent.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
      const next = [...code];
      next[index - 1] = "";
      setCode(next);
    }
  }

  const errorMsg = verifyOtp.isError
    ? getErrorMessage(verifyOtp.error)
    : sendOtp.isError
      ? getErrorMessage(sendOtp.error)
      : null;

  return (
    <AuthBackdrop heightFraction={0.3}>
      <View
        style={{
          flexGrow: 1,
          paddingHorizontal: theme.spacing.xl,
          paddingTop: theme.spacing.xl,
          gap: theme.spacing.md,
        }}
      >
        {/* Back button */}
        <Pressable
          onPress={() => navigation.goBack()}
          style={{ alignSelf: "flex-start", marginBottom: theme.spacing.xs }}
        >
          <Ionicons
            name="arrow-back"
            size={22}
            color={theme.colors.textPrimary}
          />
        </Pressable>

        <AppText variant="title">Check your email</AppText>
        <AppText
          variant="body"
          style={{
            color: theme.colors.textSecondary,
            marginTop: -theme.spacing.sm,
            marginBottom: theme.spacing.sm,
          }}
        >
          We sent a 6-digit code to{" "}
          <AppText variant="body" weight="semiBold" style={{ color: theme.colors.textPrimary }}>
            {email}
          </AppText>
          . Enter it below to continue.
        </AppText>

        {/* OTP boxes */}
        <View style={styles.otpRow}>
          {Array.from({ length: CODE_LENGTH }).map((_, i) => (
            <TextInput
              key={i}
              ref={(r) => {
                inputRefs.current[i] = r;
              }}
              style={[
                styles.otpBox,
                {
                  borderColor:
                    focusedIndex === i
                      ? theme.colors.primary
                      : theme.colors.border,
                  backgroundColor: theme.colors.surfaceAlt,
                  color: theme.colors.textPrimary,
                  borderRadius: theme.radii.input,
                },
              ]}
              value={code[i]}
              onChangeText={(t) => handleChange(t, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              onFocus={() => setFocusedIndex(i)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              selectTextOnFocus
            />
          ))}
        </View>

        {errorMsg ? (
          <AppText variant="label" style={{ color: theme.colors.error }}>
            {errorMsg}
          </AppText>
        ) : null}

        <Button
          label="Verify Code"
          isLoading={verifyOtp.isPending}
          loadingLabel="Verifying…"
          disabled={code.join("").length < CODE_LENGTH || verifyOtp.isPending}
          onPress={() => verifyOtp.mutate(code.join(""))}
        />

        {/* Resend link */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: theme.spacing.xs,
          }}
        >
          <AppText variant="body" style={{ color: theme.colors.textSecondary }}>
            Didn't receive a code?
          </AppText>
          {cooldown > 0 ? (
            <AppText
              variant="body"
              style={{ color: theme.colors.textTertiary }}
            >
              Resend in {cooldown}s
            </AppText>
          ) : (
            <Pressable onPress={handleSend} disabled={sendOtp.isPending}>
              <AppText
                variant="body"
                weight="bold"
                style={{ color: theme.colors.primary }}
              >
                {sendOtp.isPending ? "Sending…" : "Resend"}
              </AppText>
            </Pressable>
          )}
        </View>
      </View>
    </AuthBackdrop>
  );
}

const styles = StyleSheet.create({
  otpRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    marginVertical: 8,
  },
  otpBox: {
    width: 46,
    height: 56,
    borderWidth: 1.5,
    fontSize: 22,
    fontWeight: "700",
    ...Platform.select({ web: { outlineStyle: "none" } as any }),
  },
});
