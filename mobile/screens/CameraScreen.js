import { useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { analyzeScan } from "../services/scanPipeline";
import { enrichItem } from "../services/enrich";
import { STORAGE_LOCATIONS, CATEGORIES } from "../data/foodCatalog";
import { useInventory } from "../context/InventoryContext";

import { AnimatedScreen } from "../components/animations/AnimatedScreen";
import { AnimatedTouchableOpacity } from "../components/animations/AnimatedTouchableOpacity";

const COLORS = {
  background: "#FFF9F0",
  card: "#F8F0E3",
  primary: "#5C4033",
  accent: "#B86B4B",
  gold: "#D6A85F",
  text: "#2F241F",
  muted: "#7A6A60",
  border: "#E6D8C8",
  white: "#FFFFFF",
  success: "#6F9B72",
  warning: "#D89B3D",
  danger: "#C95C54",
};

const BRAND = COLORS.primary;
const BRAND_GREEN = COLORS.success;

const FLAG_LABELS = {
  discoloration: "Discoloration",
  texture_abnormality: "Texture issues",
  packaging_damage: "Packaging damage",
  mold_spots: "Mold spots",
  excess_moisture: "Excess moisture",
};

const FLAG_ICONS = {
  discoloration: "color-palette-outline",
  texture_abnormality: "flask-outline",
  packaging_damage: "bandage-outline",
  mold_spots: "leaf-outline",
  excess_moisture: "water-outline",
};

const FLAG_LIST = Object.keys(FLAG_LABELS);

// ─────────────────────────────────────────────────────────────
// Styles (simplified design)
// ─────────────────────────────────────────────────────────────

const screenScrollStyle = {
  flex: 1,
  backgroundColor: COLORS.background,
};

const resultScrollContentStyle = {
  paddingHorizontal: 20,
  paddingTop: 52,
  paddingBottom: 120,
};

const captureScrollContentStyle = {
  paddingHorizontal: 20,
  paddingTop: 40,
  paddingBottom: 120,
};

const headerTitleStyle = {
  fontSize: 26,
  fontWeight: "800",
  color: COLORS.text,
  marginBottom: 6,
};

const headerSubtitleStyle = {
  fontSize: 14,
  color: COLORS.muted,
  lineHeight: 20,
  marginBottom: 18,
};

const cardStyle = {
  backgroundColor: COLORS.white,
  borderRadius: 20,
  borderWidth: 1,
  borderColor: COLORS.border,
  padding: 16,
  marginBottom: 16,
  shadowColor: COLORS.primary,
  shadowOpacity: 0.04,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 3 },
  elevation: 1,
};

const sectionTitleRowStyle = {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 12,
};

const sectionIconBoxStyle = {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: COLORS.card,
  alignItems: "center",
  justifyContent: "center",
  marginRight: 10,
};

const sectionTitleStyle = {
  fontSize: 16,
  fontWeight: "700",
  color: COLORS.text,
};

const sectionSubtitleStyle = {
  fontSize: 12,
  color: COLORS.muted,
  marginTop: 2,
};

const rowBetweenStyle = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingVertical: 8,
};

const rowLabelStyle = {
  fontSize: 13,
  color: COLORS.muted,
};

const rowValueStyle = {
  fontSize: 13,
  fontWeight: "600",
  color: COLORS.text,
};

const badgeRowStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  marginTop: 10,
};

const badgeStyle = {
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 999,
  marginRight: 8,
  marginBottom: 8,
};

const badgeTextStyle = {
  fontSize: 12,
  fontWeight: "700",
  color: "#ffffff",
};

const spoilageBarBgStyle = {
  height: 9,
  borderRadius: 999,
  backgroundColor: COLORS.border,
  overflow: "hidden",
  marginTop: 6,
};

const spoilageBarFillStyle = (score = 0) => {
  const safeScore = Math.max(0, Math.min(1, Number(score) || 0));

  return {
    height: "100%",
    width: `${safeScore * 100}%`,
    borderRadius: 999,
    backgroundColor:
      safeScore >= 0.7
        ? COLORS.danger
        : safeScore >= 0.4
          ? COLORS.warning
          : COLORS.success,
  };
};

const indicatorPillStyle = {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 999,
  backgroundColor: "#F9E9E5",
  borderWidth: 1,
  borderColor: "#E7C4BA",
  marginRight: 8,
  marginBottom: 8,
};

const indicatorTextStyle = {
  fontSize: 11,
  fontWeight: "600",
  color: COLORS.danger,
  marginLeft: 4,
};

const noIndicatorsBoxStyle = {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#EEF4EA",
  borderWidth: 1,
  borderColor: "#C9DEC8",
  borderRadius: 12,
  padding: 10,
};

const ttiCardStyle = {
  backgroundColor: COLORS.card,
  borderRadius: 16,
  padding: 14,
  marginBottom: 16,
};

const ttiHeaderStyle = {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 10,
};

const ttiIconBoxStyle = {
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: BRAND,
  alignItems: "center",
  justifyContent: "center",
  marginRight: 8,
};

const ttiTitleStyle = {
  fontSize: 14,
  fontWeight: "700",
  color: COLORS.text,
};

const ttiSubtitleStyle = {
  fontSize: 11,
  color: COLORS.muted,
  marginTop: 1,
};

const ttiSubCardStyle = {
  backgroundColor: COLORS.white,
  borderRadius: 12,
  padding: 10,
  marginBottom: 8,
};

const urgencyTextStyle = (urgency) => ({
  fontSize: 14,
  fontWeight: "700",
  color:
    urgency === "critical"
      ? "#dc2626"
      : urgency === "high"
        ? "#ea580c"
        : urgency === "moderate"
          ? "#ca8a04"
          : "#16a34a",
});

const primaryActionBoxStyle = {
  backgroundColor: "#F3E4D5",
  borderRadius: 12,
  padding: 10,
};

const primaryActionTitleStyle = {
  fontSize: 13,
  fontWeight: "700",
  color: BRAND,
  marginBottom: 4,
};

const primaryActionLabelStyle = {
  fontSize: 13,
  fontWeight: "600",
  color: COLORS.text,
};

const primaryActionDescStyle = {
  fontSize: 11,
  color: COLORS.muted,
  marginTop: 2,
  lineHeight: 16,
};

const recsSectionTitleStyle = {
  fontSize: 14,
  fontWeight: "700",
  color: COLORS.text,
  marginBottom: 10,
  marginTop: 6,
};

const recCardStyle = {
  backgroundColor: COLORS.card,
  borderRadius: 12,
  padding: 12,
  marginBottom: 10,
};

const recRowStyle = {
  flexDirection: "row",
  alignItems: "flex-start",
};

const recIconBoxStyle = {
  width: 28,
  height: 28,
  borderRadius: 14,
  backgroundColor: "#F3E4D5",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 8,
};

const recLabelStyle = {
  fontSize: 13,
  fontWeight: "600",
  color: COLORS.text,
  flex: 1,
};

const recDescStyle = {
  fontSize: 11,
  color: COLORS.muted,
  marginTop: 2,
  lineHeight: 16,
  flex: 1,
};

const usageIdeaRowStyle = {
  flexDirection: "row",
  alignItems: "flex-start",
  marginBottom: 10,
};

const usageIconBoxStyle = {
  width: 26,
  height: 26,
  borderRadius: 13,
  backgroundColor: "#EEF4EA",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 8,
};

const usageTextStyle = {
  fontSize: 12,
  color: COLORS.text,
  lineHeight: 18,
  flex: 1,
};

const actionButtonStyle = {
  height: 50,
  borderRadius: 16,
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "row",
  marginBottom: 10,
};

const addToShelfButtonStyle = {
  ...actionButtonStyle,
  backgroundColor: BRAND_GREEN,
};

const scanAgainButtonStyle = {
  ...actionButtonStyle,
  backgroundColor: COLORS.white,
  borderWidth: 1,
  borderColor: COLORS.border,
};

const actionButtonTextStyle = {
  color: COLORS.white,
  fontSize: 14,
  fontWeight: "800",
  marginLeft: 8,
};

const scanAgainButtonTextStyle = {
  color: COLORS.text,
  fontSize: 14,
  fontWeight: "700",
  marginLeft: 8,
};

// Capture / Review styles

const previewContainerStyle = {
  height: 220,
  borderRadius: 16,
  overflow: "hidden",
  backgroundColor: COLORS.primary,
  marginBottom: 16,
};

const previewImageStyle = {
  width: "100%",
  height: "100%",
};

const previewEmptyStyle = {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
};

const previewEmptyIconContainerStyle = {
  width: 64,
  height: 64,
  borderRadius: 32,
  backgroundColor: "rgba(255,255,255,0.12)",
  alignItems: "center",
  justifyContent: "center",
};

const previewEmptyTitleStyle = {
  color: "#ffffff",
  fontSize: 15,
  fontWeight: "700",
  marginTop: 12,
};

const previewEmptySubtitleStyle = {
  color: "#D8C9BC",
  fontSize: 12,
  marginTop: 4,
  textAlign: "center",
  paddingHorizontal: 20,
};

const captureButtonStyle = {
  height: 54,
  borderRadius: 10,
  borderWidth: 15,
  backgroundColor: COLORS.border,
  borderColor: COLORS.border,
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "row",
  marginBottom: 8,
};

const galleryButtonStyle = {
  height: 50,
  borderRadius: 10,
  borderWidth: 15,
  borderColor: COLORS.border,
  backgroundColor: COLORS.border,
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "row",
};

const galleryButtonTextStyle = {
  color: BRAND,
  fontSize: 15,
  fontWeight: "700",
  marginLeft: 8,
};

const retakeButtonStyle = {
  height: 60,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 14,
};

const retakeButtonTextStyle = {
  color: BRAND,
  fontSize: 13,
  fontWeight: "600",
};

const fieldLabelStyle = {
  fontSize: 13,
  fontWeight: "700",
  color: COLORS.text,
  marginBottom: 8,
  marginTop: 4,
};

const textInputStyle = {
  height: 44,
  borderRadius: 10,
  borderWidth: 1,
  borderColor: COLORS.border,
  backgroundColor: COLORS.white,
  paddingHorizontal: 12,
  fontSize: 14,
  color: COLORS.text,
  marginBottom: 12,
};

const horizontalScrollContentStyle = {
  marginBottom: 12,
};

const categoryPillStyle = (active) => ({
  marginRight: 8,
  height: 36,
  paddingHorizontal: 15,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: active ? BRAND : COLORS.border,
  backgroundColor: active ? BRAND : COLORS.white,
  alignItems: "center",
  justifyContent: "center",
});

const categoryPillTextStyle = (active) => ({
  fontSize: 12,
  fontWeight: "700",
  color: active ? COLORS.white : COLORS.text,
});

const storagePillStyle = (active) => ({
  marginRight: 8,
  height: 36,
  paddingHorizontal: 14,
  borderRadius: 18,
  borderWidth: 1,
  borderColor: active ? BRAND : COLORS.border,
  backgroundColor: active ? "#F3E4D5" : COLORS.white,
  alignItems: "center",
  justifyContent: "center",
});

const storagePillTextStyle = (active) => ({
  fontSize: 11,
  fontWeight: "700",
  color: active ? BRAND : COLORS.muted,
});

const flagsContainerStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  marginBottom: 16,
};

const flagPillStyle = (active) => ({
  flexDirection: "row",
  alignItems: "center",
  marginRight: 8,
  marginBottom: 8,
  height: 34,
  paddingHorizontal: 10,
  borderRadius: 17,
  backgroundColor: active ? "#fee2e2" : "#f1f5f9",
  borderWidth: 1,
  borderColor: active ? "#ef4444" : COLORS.border,
});

const flagPillTextStyle = (active) => ({
  fontSize: 11,
  fontWeight: active ? "700" : "500",
  color: active ? "#b91c1c" : "#475569",
  marginLeft: 4,
});

const analyzeButtonStyle = {
  height: 60,
  borderRadius: 12,
  backgroundColor: BRAND,
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "row",
  marginBottom: 10,
};

const cancelButtonStyle = {
  height: 60,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: COLORS.border,
  backgroundColor: COLORS.white,
  alignItems: "center",
  justifyContent: "center",
};

const cancelButtonTextStyle = {
  color: COLORS.muted,
  fontSize: 14,
  fontWeight: "600",
};

const buttonTextStyle = {
  color: COLORS.BRAND,
  fontSize: 16,
  fontWeight: "700",
  marginLeft: 8,
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export function CameraScreen() {
  const navigation = useNavigation();
  const { addItem } = useInventory();

  const [step, setStep] = useState("capture"); // capture | review | result
  const [imageUri, setImageUri] = useState(null);
  const [category, setCategory] = useState("Dairy");
  const [storageId, setStorageId] = useState("fridge_top");
  const [labelText, setLabelText] = useState("");
  const [foodNameOverride, setFoodNameOverride] = useState("");
  const [flags, setFlags] = useState([]);
  const [busy, setBusy] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [preview, setPreview] = useState(null);

  const toggleFlag = (key) => {
    setFlags((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key],
    );
  };

  const safeNumber = (value, fallback = 0) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  };

  const formatPercentage = (value) => {
    return `${Math.round(Math.max(0, Math.min(1, safeNumber(value))) * 100)}%`;
  };

  const formatDate = (value) => {
    if (!value) return "Not found";

    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "Not found"
      : date.toLocaleDateString();
  };

  const pickImage = async (fromCamera) => {
    try {
      const permission = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission needed",
          fromCamera
            ? "Allow camera access to take a food photo."
            : "Allow photo access to choose a food image.",
        );
        return;
      }

      const pickerOptions = {
        quality: 0.7,
        allowsEditing: true,
        aspect: [3, 4],
        mediaTypes: ["images"],
      };

      const result = fromCamera
        ? await ImagePicker.launchCameraAsync(pickerOptions)
        : await ImagePicker.launchImageLibraryAsync(pickerOptions);

      if (result.canceled || !result.assets?.[0]?.uri) {
        return;
      }

      setImageUri(result.assets[0].uri);
      setStep("review");
      setAnalysis(null);
      setPreview(null);
    } catch (error) {
      Alert.alert(
        "Unable to select image",
        error?.message || "Please try again.",
      );
    }
  };

  const runAnalysis = async () => {
    if (!imageUri) {
      Alert.alert("No image", "Capture or choose a food package photo first.");
      return;
    }

    setBusy(true);

    try {
      const result = await analyzeScan({
        imageUri,
        labelText: labelText.trim(),
        category,
        storageId,
        userFlags: flags,
        packagingDamaged: flags.includes("packaging_damage"),
        foodNameOverride: foodNameOverride.trim() || undefined,
      });

      if (!result?.draftItem) {
        throw new Error("The scan did not return a valid food item.");
      }

      const now = new Date().toISOString();

      const enriched = enrichItem({
        ...result.draftItem,
        imageUri,
        category,
        storageId,
        scannedAt: now,
        createdAt: now,
      });

      setAnalysis(result);
      setPreview(enriched);
      setStep("result");
    } catch (error) {
      Alert.alert(
        "Scan failed",
        error?.message || "Unable to analyze the image.",
      );
    } finally {
      setBusy(false);
    }
  };

  const saveToShelf = async () => {
    if (!preview) {
      Alert.alert("Nothing to save", "Run an analysis before saving the item.");
      return;
    }

    setBusy(true);

    try {
      await addItem(preview);

      Alert.alert(
        "Saved to shelf",
        `${preview.title || "This item"} was added to your shelf.`,
        [
          {
            text: "View Shelf",
            onPress: () => navigation.navigate("Shelf"),
          },
          {
            text: "Scan Another",
            onPress: reset,
          },
        ],
      );
    } catch (error) {
      Alert.alert("Save failed", error?.message || "Could not save the item.");
    } finally {
      setBusy(false);
    }
  };

  const reset = () => {
    setStep("capture");
    setImageUri(null);
    setCategory("Dairy");
    setStorageId("fridge_top");
    setLabelText("");
    setFoodNameOverride("");
    setFlags([]);
    setAnalysis(null);
    setPreview(null);
    setBusy(false);
  };

  // ───────────────────────────────────────────────────────────
  // Result View
  // ───────────────────────────────────────────────────────────

  if (step === "result" && preview) {
    return (
<AnimatedScreen direction="center">        <ScrollView
          style={screenScrollStyle}
          contentContainerStyle={resultScrollContentStyle}
        >
          {/* Header */}
          <View style={{ marginBottom: 18 }}>
            <Text style={headerTitleStyle}>Scan Result</Text>
            <Text style={headerSubtitleStyle}>
              OCR + CNN + TTI + risk scoring complete
            </Text>
          </View>

          {/* Food Image */}
          <View
            style={{
              borderRadius: 16,
              overflow: "hidden",
              backgroundColor: colors.border,
              marginBottom: 16,
            }}
          >
            {preview.imageUri ? (
              <Image
                source={{ uri: preview.imageUri }}
                style={{ width: "100%", height: 200 }}
                resizeMode="cover"
              />
            ) : (
              <View
                style={{
                  width: "100%",
                  height: 200,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="image-outline" size={40} color={COLORS.muted} />
                <Text
                  style={{ color: COLORS.muted, fontSize: 13, marginTop: 6 }}
                >
                  No image available
                </Text>
              </View>
            )}
          </View>

          {/* Food Summary */}
          <View style={cardStyle}>
            <Text
              style={{ fontSize: 18, fontWeight: "800", color: COLORS.text }}
            >
              {preview.title}
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 4,
              }}
            >
              <Text style={{ fontSize: 12, color: COLORS.muted }}>
                {preview.category}
              </Text>
              <Text style={{ color: COLORS.card, marginHorizontal: 6 }}>
                -{" "}
              </Text>
              <Text style={{ fontSize: 12, color: COLORS.muted }}>
                {preview.subtitle}
              </Text>
            </View>

            <View style={badgeRowStyle}>
              <View
                style={[
                  badgeStyle,
                  {
                    backgroundColor: preview.freshnessLabel
                      ?.toLowerCase()
                      .includes("fresh")
                      ? "#22c55e"
                      : "#ef4444",
                  },
                ]}
              >
                <Text style={badgeTextStyle}>{preview.freshnessLabel}</Text>
              </View>

              <View style={[badgeStyle, { backgroundColor: BRAND }]}>
                <Text style={badgeTextStyle}>
                  Risk {(preview.riskScore * 100).toFixed(0)}%
                </Text>
              </View>

              <View style={[badgeStyle, { backgroundColor: COLORS.border }]}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: COLORS.text,
                  }}
                >
                  {preview.daysLabel}
                </Text>
              </View>
            </View>
          </View>

          {/* OCR Extraction */}
          <View style={cardStyle}>
            <View style={sectionTitleRowStyle}>
              <View style={sectionIconBoxStyle}>
                <Ionicons
                  name="document-text-outline"
                  size={18}
                  color={BRAND}
                />
              </View>
              <View>
                <Text style={sectionTitleStyle}>OCR Extraction</Text>
                <Text style={sectionSubtitleStyle}>
                  Information extracted from the food label
                </Text>
              </View>
            </View>

            <View style={rowBetweenStyle}>
              <Text style={rowLabelStyle}>Expiry</Text>
              <Text style={rowValueStyle}>
                {formatDate(analysis?.ocr?.expiryDate)}
              </Text>
            </View>

            <View style={rowBetweenStyle}>
              <Text style={rowLabelStyle}>Manufactured</Text>
              <Text style={rowValueStyle}>
                {formatDate(analysis?.ocr?.manufacturingDate)}
              </Text>
            </View>

            <View style={rowBetweenStyle}>
              <Text style={rowLabelStyle}>Confidence</Text>
              <Text style={rowValueStyle}>
                {formatPercentage(analysis?.ocr?.confidence)}
              </Text>
            </View>

            <View
              style={{
                marginTop: 6,
                backgroundColor: COLORS.card,
                borderRadius: 10,
                padding: 10,
              }}
            >
              <Text style={{ fontSize: 11, color: colors.muted }}>
                Detection source
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "600",
                  color: COLORS.text,
                  marginTop: 2,
                }}
              >
                {analysis.ocr.source || "Unknown"}
              </Text>
            </View>
          </View>

          {/* CNN Analysis */}
          <View style={cardStyle}>
            <View style={sectionTitleRowStyle}>
              <View
                style={[sectionIconBoxStyle, { backgroundColor: "#EEF4EA" }]}
              >
                <Ionicons
                  name="scan-outline"
                  size={18}
                  color={COLORS.success}
                />
              </View>
              <View>
                <Text style={sectionTitleStyle}>CNN Analysis</Text>
                <Text style={sectionSubtitleStyle}>
                  Food identity and visible spoilage detection
                </Text>
              </View>
            </View>

            <View style={rowBetweenStyle}>
              <View>
                <Text style={rowLabelStyle}>Food Identity</Text>
                <Text
                  style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}
                >
                  Detected by CNN
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={rowValueStyle}>
                  {analysis.cnn.identity.foodName}
                </Text>
                <Text
                  style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}
                >
                  {formatPercentage(analysis?.cnn?.identity?.confidence)}{" "}
                  confidence
                </Text>
              </View>
            </View>

            <View style={{ paddingTop: 6 }}>
              <View style={rowBetweenStyle}>
                <Text style={rowLabelStyle}>Spoilage Score</Text>
                <Text style={rowValueStyle}>
                  {formatPercentage(analysis?.cnn?.spoilage?.spoilageScore)}
                </Text>
              </View>

              <View style={spoilageBarBgStyle}>
                <View
                  style={spoilageBarFillStyle(
                    analysis.cnn.spoilage.spoilageScore,
                  )}
                />
              </View>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 8,
                }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor:
                      analysis.cnn.spoilage.spoilageScore >= 0.7
                        ? "#ef4444"
                        : analysis.cnn.spoilage.spoilageScore >= 0.4
                          ? "#f59e0b"
                          : "#22c55e",
                    marginRight: 6,
                  }}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: COLORS.text,
                  }}
                >
                  Status: {analysis.cnn.spoilage.status}
                </Text>
              </View>
            </View>

            <View style={{ paddingTop: 10 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: COLORS.text,
                  marginBottom: 8,
                }}
              >
                Detected Indicators
              </Text>

              {analysis?.cnn?.spoilage?.detectedIndicators?.length > 0 ? (
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {analysis.cnn.spoilage.detectedIndicators.map((key) => (
                    <View key={key} style={indicatorPillStyle}>
                      <Ionicons
                        name={FLAG_ICONS[key] || "warning-outline"}
                        size={13}
                        color={COLORS.danger}
                      />
                      <Text style={indicatorTextStyle}>
                        {FLAG_LABELS[key] || key}
                      </Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={noIndicatorsBoxStyle}>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={COLORS.success}
                  />
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "600",
                      color: COLORS.success,
                      marginLeft: 6,
                      flex: 1,
                    }}
                  >
                    No significant spoilage indicators detected
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* TTI & Risk */}
          <View style={ttiCardStyle}>
            <View style={ttiHeaderStyle}>
              <View style={ttiIconBoxStyle}>
                <Ionicons name="time-outline" size={16} color="#ffffff" />
              </View>
              <View>
                <Text style={ttiTitleStyle}>TTI & Risk</Text>
                <Text style={ttiSubtitleStyle}>
                  Remaining shelf life and recommended action
                </Text>
              </View>
            </View>

            <View style={ttiSubCardStyle}>
              <Text style={{ fontSize: 11, color: "#64748b" }}>
                Remaining Life
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: COLORS.text,
                  marginTop: 2,
                }}
              >
                {preview.tti.remainingLifeDays} days
              </Text>
              <Text style={{ fontSize: 10, color: COLORS.muted, marginTop: 2 }}>
                Temperature-Time Indicator (TTI)
              </Text>
            </View>

            <View style={ttiSubCardStyle}>
              <Text style={{ fontSize: 11, color: "#64748b" }}>Urgency</Text>
              <Text
                style={[
                  { fontSize: 14, fontWeight: "700", marginTop: 2 },
                  urgencyTextStyle(preview.urgency),
                ]}
              >
                {preview.urgency}
              </Text>
            </View>

            <View style={primaryActionBoxStyle}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 4,
                }}
              >
                <Ionicons name="bulb-outline" size={14} color={BRAND} />
                <Text style={[primaryActionTitleStyle, { marginLeft: 6 }]}>
                  Recommended Action
                </Text>
              </View>

              <Text style={primaryActionLabelStyle}>
                {preview.recommendations.primaryAction.label}
              </Text>
              <Text style={primaryActionDescStyle}>
                {preview.recommendations.primaryAction.description}
              </Text>
            </View>
          </View>

          {/* Recommendations */}
          <View style={cardStyle}>
            <View style={sectionTitleRowStyle}>
              <View
                style={[sectionIconBoxStyle, { backgroundColor: "#fef3c7" }]}
              >
                <Ionicons name="bulb-outline" size={18} color="#d97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={sectionTitleStyle}>Recommendations</Text>
                <Text style={sectionSubtitleStyle}>
                  Suggested actions based on food condition
                </Text>
              </View>
            </View>

            <Text style={recsSectionTitleStyle}>Recommended Actions</Text>

            {preview.recommendations.ruleBased?.length > 0 ? (
              preview.recommendations.ruleBased.map((action) => (
                <View key={action.id} style={recCardStyle}>
                  <View style={recRowStyle}>
                    <View style={recIconBoxStyle}>
                      <Ionicons
                        name="checkmark-outline"
                        size={14}
                        color={BRAND}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={recLabelStyle}>{action.label}</Text>
                      <Text style={recDescStyle}>{action.description}</Text>
                    </View>
                  </View>
                </View>
              ))
            ) : (
              <View style={recCardStyle}>
                <Text style={{ fontSize: 12, color: "#64748b" }}>
                  No additional actions available.
                </Text>
              </View>
            )}

            <Text style={recsSectionTitleStyle}>Usage Ideas</Text>

            {preview.recommendations.contentBased?.usageSuggestions?.length >
            0 ? (
              preview.recommendations.contentBased.usageSuggestions.map(
                (tip, index) => (
                  <View key={`${tip}-${index}`} style={usageIdeaRowStyle}>
                    <View style={usageIconBoxStyle}>
                      <Ionicons
                        name="restaurant-outline"
                        size={13}
                        color="#16a34a"
                      />
                    </View>
                    <Text style={usageTextStyle}>{tip}</Text>
                  </View>
                ),
              )
            ) : (
              <Text style={{ fontSize: 12, color: "#64748b" }}>
                No usage suggestions available.
              </Text>
            )}
          </View>

          {/* Final Actions */}
          <View style={{ marginTop: 4, marginBottom: 4 }}>
            <AnimatedTouchableOpacity
              activeOpacity={0.85}
              style={addToShelfButtonStyle}
              onPress={saveToShelf}
              disabled={busy}
            >
              {busy ? (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <ActivityIndicator color="#ffffff" />
                  <Text
                    style={{
                      color: "#ffffff",
                      fontSize: 15,
                      fontWeight: "700",
                      marginLeft: 8,
                    }}
                  >
                    Saving...
                  </Text>
                </View>
              ) : (
                <>
                  <Ionicons
                    name="add-circle-outline"
                    size={20}
                    color="#ffffff"
                  />
                  <Text style={actionButtonTextStyle}>Add to Shelf</Text>
                </>
              )}
            </AnimatedTouchableOpacity>

            <AnimatedTouchableOpacity
              activeOpacity={0.8}
              style={scanAgainButtonStyle}
              onPress={reset}
              disabled={busy}
            >
              <Ionicons name="camera-outline" size={18} color={COLORS.text} />
              <Text style={scanAgainButtonTextStyle}>Scan Again</Text>
            </AnimatedTouchableOpacity>
          </View>
        </ScrollView>
      </AnimatedScreen>
    );
  }

  // ───────────────────────────────────────────────────────────
  // Capture / Review UI
  // ───────────────────────────────────────────────────────────

  return (
    <AnimatedScreen>
      <ScrollView
        style={screenScrollStyle}
        contentContainerStyle={captureScrollContentStyle}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: 18 }}>
          <Text style={headerTitleStyle}>Scan</Text>
          <Text style={headerSubtitleStyle}>
            {step === "review"
              ? "Review the details below, then run the analysis to detect freshness and spoilage."
              : "Capture food packaging to analyze its freshness, expiry information, and spoilage indicators."}
          </Text>
        </View>

        {/* Camera Preview */}
        <View style={previewContainerStyle}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={previewImageStyle}
              resizeMode="cover"
            />
          ) : (
            <View style={previewEmptyStyle}>
              <View style={previewEmptyIconContainerStyle}>
                <Ionicons name="camera-outline" size={32} color="#ffffff" />
              </View>

              <Text style={previewEmptyTitleStyle}>No image selected</Text>

              <Text style={previewEmptySubtitleStyle}>
                Take a photo or choose one from your gallery
              </Text>
            </View>
          )}
        </View>

        {/* Capture buttons shown only on the capture step */}
        {step === "capture" && (
          <>
            <AnimatedTouchableOpacity
              activeOpacity={0.85}
              onPress={() => pickImage(true)}
              style={captureButtonStyle}
            >
              <Ionicons name="camera" size={20} color={BRAND} />
              <Text style={buttonTextStyle}>Open Camera</Text>
            </AnimatedTouchableOpacity>

            <AnimatedTouchableOpacity
              activeOpacity={0.85}
              onPress={() => pickImage(false)}
              style={galleryButtonStyle}
            >
              <Ionicons name="images-outline" size={20} color={BRAND} />
              <Text style={galleryButtonTextStyle}>Choose from Gallery</Text>
            </AnimatedTouchableOpacity>
          </>
        )}

        {/* Review Section */}
        {step === "review" && (
          <>
            {/* Change photo */}
            <View
              style={{
                flexDirection: "row",
                marginBottom: 14,
              }}
            >
              <AnimatedTouchableOpacity
                activeOpacity={0.85}
                onPress={() => pickImage(true)}
                style={[
                  retakeButtonStyle,
                  {
                    flex: 1,
                    marginRight: 6,
                    marginBottom: 0,
                    borderRadius: 14,
                    backgroundColor: "#F3E4D5",
                  },
                ]}
              >
                <Ionicons
                  name="camera-reverse-outline"
                  size={16}
                  color={BRAND}
                />
                <Text style={retakeButtonTextStyle}>Retake</Text>
              </AnimatedTouchableOpacity>

              <AnimatedTouchableOpacity
                activeOpacity={0.85}
                onPress={() => pickImage(false)}
                style={[
                  retakeButtonStyle,
                  {
                    flex: 1,
                    marginLeft: 6,
                    marginBottom: 0,
                    borderRadius: 14,
                    backgroundColor: COLORS.card,
                  },
                ]}
              >
                <Ionicons name="images-outline" size={16} color={BRAND} />
                <Text style={retakeButtonTextStyle}>Gallery</Text>
              </AnimatedTouchableOpacity>
            </View>

            {/* Food name override */}
            <Text style={fieldLabelStyle}>Food Name</Text>
            <TextInput
              value={foodNameOverride}
              onChangeText={setFoodNameOverride}
              placeholder="Leave blank to auto-detect"
              placeholderTextColor={COLORS.muted}
              style={textInputStyle}
            />

            {/* Category selector */}
            <Text style={fieldLabelStyle}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={horizontalScrollContentStyle}
            >
              {CATEGORIES.filter((c) => c !== "All").map((cat) => {
                const active = category === cat;
                return (
                  <AnimatedTouchableOpacity
                    key={cat}
                    onPress={() => setCategory(cat)}
                    activeOpacity={0.8}
                    style={categoryPillStyle(active)}
                  >
                    <Text style={categoryPillTextStyle(active)}>{cat}</Text>
                  </AnimatedTouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Storage selector */}
            <Text style={fieldLabelStyle}>Storage</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={horizontalScrollContentStyle}
            >
              {STORAGE_LOCATIONS.map((loc) => {
                const active = storageId === loc.id;
                return (
                  <AnimatedTouchableOpacity
                    key={loc.id}
                    onPress={() => setStorageId(loc.id)}
                    activeOpacity={0.8}
                    style={storagePillStyle(active)}
                  >
                    <Text style={storagePillTextStyle(active)}>
                      {loc.label}
                    </Text>
                  </AnimatedTouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Label text */}
            <Text style={fieldLabelStyle}>Label Text (optional)</Text>
            <TextInput
              value={labelText}
              onChangeText={setLabelText}
              placeholder="Expiry date or text on the label"
              placeholderTextColor={COLORS.muted}
              style={textInputStyle}
            />

            {/* Spoilage flags */}
            <Text style={fieldLabelStyle}>Spoilage Indicators</Text>
            <View style={flagsContainerStyle}>
              {FLAG_LIST.map((key) => {
                const active = flags.includes(key);
                return (
                  <AnimatedTouchableOpacity
                    key={key}
                    onPress={() => toggleFlag(key)}
                    activeOpacity={0.8}
                    style={flagPillStyle(active)}
                  >
                    <Ionicons
                      name={FLAG_ICONS[key]}
                      size={14}
                      color={active ? "#ef4444" : "#64748b"}
                    />
                    <Text style={flagPillTextStyle(active)}>
                      {FLAG_LABELS[key]}
                    </Text>
                  </AnimatedTouchableOpacity>
                );
              })}
            </View>

            {/* Analyze button */}
            <AnimatedTouchableOpacity
              activeOpacity={0.85}
              onPress={runAnalysis}
              disabled={busy}
              style={analyzeButtonStyle}
            >
              {busy ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="scan-outline" size={18} color="#ffffff" />
                  <Text style={buttonTextStyle}>Analyze</Text>
                </>
              )}
            </AnimatedTouchableOpacity>

            <AnimatedTouchableOpacity
              activeOpacity={0.85}
              onPress={reset}
              style={cancelButtonStyle}
            >
              <Text style={cancelButtonTextStyle}>Cancel</Text>
            </AnimatedTouchableOpacity>
          </>
        )}
      </ScrollView>
    </AnimatedScreen>
  );
}
