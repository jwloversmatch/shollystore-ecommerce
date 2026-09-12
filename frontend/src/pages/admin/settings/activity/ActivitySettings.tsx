import { History } from "lucide-react";
import { useGetSettingsChangesQuery } from "../../../../features/api/apiSlice";
import SettingsSection from "../_components/SettingsSection";
import AuditLog from "../AuditLog";

const ActivitySettings = () => {
  const { data: changeLogs = [] } = useGetSettingsChangesQuery({});

  return (
    <SettingsSection
      title="Activity Log"
      description="Every change made to settings, with who and when."
      icon={<History className="w-4 h-4" />}
      iconBg="rgba(139,92,246,0.12)"
      iconColor="#8b5cf6"
      accentGradient="linear-gradient(90deg, transparent, #8b5cf6, transparent)"
    >
      <AuditLog changeLogs={changeLogs} />
    </SettingsSection>
  );
};

export default ActivitySettings;