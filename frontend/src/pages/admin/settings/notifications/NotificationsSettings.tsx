import { Bell } from "lucide-react";
import SettingsSection from "../_components/SettingsSection";
import PushNotifications from "../PushNotifications";

const NotificationsSettings = () => (
  <SettingsSection
    title="Push Notifications"
    description="Broadcast a push notification to all customers."
    icon={<Bell className="w-4 h-4" />}
    iconBg="rgba(139,92,246,0.12)"
    iconColor="#8b5cf6"
    accentGradient="linear-gradient(90deg, transparent, #8b5cf6, transparent)"
  >
    <PushNotifications />
  </SettingsSection>
);

export default NotificationsSettings;