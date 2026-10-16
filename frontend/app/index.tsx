import { Redirect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { routeForStatus } from "@/context/authRouting";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { status, user } = useAuth();
  const href = routeForStatus(status, user);

  if (!href) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Redirect href={href} />;
}
