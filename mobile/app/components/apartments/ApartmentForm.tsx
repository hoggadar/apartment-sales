import * as React from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Select } from "./Select";
import {
  fetchMetadata,
  predictPrice,
  type Metadata,
  type PredictRequest,
} from "../../lib/api";

const defaultForm: PredictRequest = {
  bedrooms: 3,
  bathrooms: 2,
  sqft_living: 1500,
  sqft_lot: 2000,
  floors: 2,
  waterfront: 0,
  view: 0,
  condition: 3,
  sqft_basement: 0,
  city: "",
  statezip: "",
  yr_built: 2000,
  yr_renovated: 0,
};

export function ApartmentForm() {
  const [metadata, setMetadata] = React.useState<Metadata | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [form, setForm] = React.useState<PredictRequest>(defaultForm);
  const [result, setResult] = React.useState<number | null>(null);

  React.useEffect(() => {
    fetchMetadata()
      .then(setMetadata)
      .catch((e) => Alert.alert("Ошибка", e.message))
      .finally(() => setLoading(false));
  }, []);

  const update = <K extends keyof PredictRequest>(
    key: K,
    value: PredictRequest[K]
  ) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.city || !form.statezip) {
      Alert.alert("Заполните форму", "Выберите город и индекс");
      return;
    }
    setSubmitting(true);
    setResult(null);
    try {
      const { price_usd } = await predictPrice(form);
      setResult(price_usd);
    } catch (e) {
      Alert.alert("Ошибка", e instanceof Error ? e.message : "Не удалось получить прогноз");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !metadata) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-3 text-neutral-500">Загрузка данных...</Text>
      </View>
    );
  }

  const cities = metadata.categorical_values?.city ?? metadata.cities ?? [];
  const zips = metadata.categorical_values?.zip ?? metadata.zips ?? [];
  const waterfrontOpts = metadata.categorical_values?.waterfront ?? ["0", "1"];
  const viewOpts = metadata.categorical_values?.view ?? ["0", "1", "2", "3", "4"];
  const conditionOpts =
    metadata.categorical_values?.condition ?? ["1", "2", "3", "4", "5"];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text className="text-xl font-bold text-neutral-900 mb-4">
          Оценка стоимости квартиры
        </Text>

        {/* Categorical — dropdown */}
        <Select
          label="Город"
          value={form.city}
          options={cities}
          onSelect={(v) => update("city", v)}
        />
        <Select
          label="Индекс (ZIP)"
          value={form.statezip ? form.statezip.replace(/^WA\s*/i, "").trim() : ""}
          options={zips}
          placeholder="Выберите индекс"
          onSelect={(v) => update("statezip", `WA ${v}`)}
        />
        <Select
          label="Вид на воду"
          value={String(form.waterfront)}
          options={waterfrontOpts}
          onSelect={(v) => update("waterfront", parseInt(v, 10))}
        />
        <Select
          label="Качество вида (0–4)"
          value={String(form.view)}
          options={viewOpts}
          onSelect={(v) => update("view", parseInt(v, 10))}
        />
        <Select
          label="Состояние (1–5)"
          value={String(form.condition)}
          options={conditionOpts}
          onSelect={(v) => update("condition", parseInt(v, 10))}
        />

        {/* Numerical fields */}
        <InputRow
          label="Спален"
          value={form.bedrooms}
          onChange={(v) => update("bedrooms", v)}
          keyboardType="numeric"
        />
        <InputRow
          label="Ванных"
          value={form.bathrooms}
          onChange={(v) => update("bathrooms", v)}
          keyboardType="decimal-pad"
        />
        <InputRow
          label="Жилая площадь (кв. футы)"
          value={form.sqft_living}
          onChange={(v) => update("sqft_living", v)}
          keyboardType="numeric"
        />
        <InputRow
          label="Площадь участка (кв. футы)"
          value={form.sqft_lot}
          onChange={(v) => update("sqft_lot", v)}
          keyboardType="numeric"
        />
        <InputRow
          label="Этажей"
          value={form.floors}
          onChange={(v) => update("floors", v)}
          keyboardType="numeric"
        />
        <InputRow
          label="Площадь подвала (кв. футы)"
          value={form.sqft_basement}
          onChange={(v) => update("sqft_basement", v)}
          keyboardType="numeric"
        />
        <InputRow
          label="Год постройки"
          value={form.yr_built}
          onChange={(v) => update("yr_built", v)}
          keyboardType="numeric"
        />
        <InputRow
          label="Год ремонта (0 — не было)"
          value={form.yr_renovated}
          onChange={(v) => update("yr_renovated", v)}
          keyboardType="numeric"
        />

        <Pressable
          onPress={handleSubmit}
          disabled={submitting}
          className="mt-6 bg-blue-500 rounded-xl py-4 items-center disabled:opacity-60"
        >
          {submitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">
              Оценить стоимость
            </Text>
          )}
        </Pressable>

        {result && (
          <View className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4">
            <Text className="text-sm text-green-600 mb-1">Прогноз цены</Text>
            <Text className="text-2xl font-bold text-green-800">
              ${result.toLocaleString("en-US", { minimumFractionDigits: 0 })}
            </Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function InputRow({
  label,
  value,
  onChange,
  keyboardType = "default",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  keyboardType?: "default" | "numeric" | "decimal-pad";
}) {
  const [text, setText] = React.useState(String(value));
  React.useEffect(() => setText(String(value)), [value]);

  const commit = () => {
    const n = parseFloat(text);
    if (!Number.isNaN(n) && n >= 0) onChange(n);
    else setText(String(value));
  };

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-neutral-700 mb-1.5">{label}</Text>
      <TextInput
        value={text}
        onChangeText={setText}
        onBlur={commit}
        keyboardType={keyboardType}
        className="bg-neutral-100 border border-neutral-200 rounded-xl px-4 py-3.5 text-base text-neutral-900 min-h-[48px]"
        placeholderTextColor="#a3a3a3"
      />
    </View>
  );
}
