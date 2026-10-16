import { Redirect, type Href } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuth();
  let url: Href = "/auth/login";

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (isAuthenticated) {
    if (user?.active) {
      url = "/(tabs)/new";
    } else {
      url = "/auth/activate";
    }
  }

  return <Redirect href={url} />;
}
