/**
 * Create tab placeholder
 * This screen is never rendered because href: null in tab configuration
 * The create button in the tab bar directly opens /upload via tabBarButton
 * This prevents navigation trap where users get stuck in create -> upload loop
 */
export default function CreateScreen() {
  return null;
}
