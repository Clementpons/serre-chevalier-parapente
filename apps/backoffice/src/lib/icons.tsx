/**
 * Centralized icon wrappers — maps HugeIcons free pack to Lucide-style interface.
 * All icons accept: className, size (default 16), strokeWidth (default 1.5)
 * Import from here instead of lucide-react or @hugeicons/* directly.
 */
import { HugeiconsIcon, type HugeiconsIconProps } from "@hugeicons/react";
import {
  // Navigation
  Home01Icon,
  Calendar01Icon,
  Calendar03Icon,
  CalendarCheckIn01Icon,
  GiftIcon,
  Ticket01Icon,
  GraduationScrollIcon,
  PencilEdit01Icon,
  ShoppingCart01Icon,
  UserGroup02Icon,
  UserGroup03Icon,
  UserCheck01Icon,
  CreditCardIcon,
  LayoutGridIcon,
  Mail01Icon,
  Tag01Icon,
  UserMultipleIcon,
  // UI
  Notification01Icon,
  ArrowRight01Icon,
  ArrowLeft01Icon,
  ArrowDown01Icon,
  ArrowUp01Icon,
  ArrowUpRight01Icon,
  Logout01Icon,
  Loading03Icon,
  // Dashboard
  ChartIncreaseIcon,
  MountainIcon,
  Airplane01Icon,
  EuroIcon,
  Analytics01Icon,
  ChartColumnIcon,
  Money01Icon,
  // Actions
  Search01Icon,
  Add01Icon,
  Delete02Icon,
  SaveIcon,
  Cancel01Icon,
  CancelCircleIcon,
  CheckmarkCircle01Icon,
  CheckmarkBadge01Icon,
  Download01Icon,
  SlidersHorizontalIcon,
  FilterIcon,
  Refresh01Icon,
  Copy01Icon,
  // Content
  Video01Icon,
  Note01Icon,
  Alert01Icon,
  InformationCircleIcon,
  PercentIcon,
  // Contact
  CallIcon,
  Clock01Icon,
  MapPinIcon,
  // People
  User03Icon,
  UserAdd01Icon,
  UserCircleIcon,
  UserEdit01Icon,
  // Misc
  WeightIcon,
  RulerIcon,
  CakeSliceIcon,
  Sun01Icon,
  Moon01Icon,
  ViewSidebarLeftIcon,
  Settings01Icon,
  MinusSignIcon,
  PlusSignIcon,
  // Extra
  Sad01Icon,
  ArrowUpDownIcon,
  EyeIcon,
  ViewOffSlashIcon,
  SentIcon,
  Tick01Icon,
  SortingIcon,
} from "@hugeicons/core-free-icons";
import type { SVGProps } from "react";

type IconData = HugeiconsIconProps["icon"];

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "ref"> {
  size?: number | string;
  strokeWidth?: number;
  className?: string;
}

function icon(iconData: IconData) {
  return function Icon({
    className,
    size = 16,
    strokeWidth = 1.5,
    ...rest
  }: IconProps) {
    return (
      <HugeiconsIcon
        icon={iconData}
        size={size}
        strokeWidth={strokeWidth}
        primaryColor="currentColor"
        className={className}
        {...(rest as any)}
      />
    );
  };
}

// ─── Navigation ───────────────────────────────────────────────────────────────
export const HomeIcon = icon(Home01Icon);
export const CalendarIcon = icon(Calendar01Icon);
export const CalendarDaysIcon = icon(Calendar03Icon);
export const CalendarCheckIcon = icon(CalendarCheckIn01Icon);
export const GiftCardIcon = icon(GiftIcon);
export const TicketIcon = icon(Ticket01Icon);
export const GraduationIcon = icon(GraduationScrollIcon);
export const PencilLineIcon = icon(PencilEdit01Icon);
export const ShoppingCartIcon = icon(ShoppingCart01Icon);
export const UsersGroupIcon = icon(UserGroup02Icon);
export const UsersRoundIcon = icon(UserGroup03Icon);
export const UserCheckIcon = icon(UserCheck01Icon);
export const CreditCardIcon2 = icon(CreditCardIcon);
export const LayoutIcon = icon(LayoutGridIcon);
export const MailCheckIcon = icon(Mail01Icon);
export const TagIcon = icon(Tag01Icon);
export const UsersIcon = icon(UserMultipleIcon);

// ─── UI Controls ──────────────────────────────────────────────────────────────
export const BellIcon = icon(Notification01Icon);
export const ChevronRightIcon = icon(ArrowRight01Icon);
export const ChevronLeftIcon = icon(ArrowLeft01Icon);
export const ChevronDownIcon = icon(ArrowDown01Icon);
export const ChevronUpIcon = icon(ArrowUp01Icon);
export const ExternalLinkIcon = icon(ArrowUpRight01Icon);
export const LogoutIcon = icon(Logout01Icon);
export const LoaderIcon = icon(Loading03Icon);
export const SidebarIcon = icon(ViewSidebarLeftIcon);

// ─── Dashboard / Analytics ────────────────────────────────────────────────────
export const TrendingUpIcon = icon(ChartIncreaseIcon);
export const MountainIcon2 = icon(MountainIcon);
export const AirplaneIcon = icon(Airplane01Icon);
export const EuroSignIcon = icon(EuroIcon);
export const AnalyticsIcon = icon(Analytics01Icon);
export const BarChartIcon = icon(ChartColumnIcon);
export const MoneyIcon = icon(Money01Icon);

// ─── Actions ──────────────────────────────────────────────────────────────────
export const SearchIcon = icon(Search01Icon);
export const PlusIcon = icon(Add01Icon);
export const MinusIcon = icon(MinusSignIcon);
export const PlusSignIcon2 = icon(PlusSignIcon);
export const TrashIcon = icon(Delete02Icon);
export const EditIcon = icon(PencilEdit01Icon);
export const SaveIcon2 = icon(SaveIcon);
export const XIcon = icon(Cancel01Icon);
export const XCircleIcon = icon(CancelCircleIcon);
export const CheckCircleIcon = icon(CheckmarkCircle01Icon);
export const CheckBadgeIcon = icon(CheckmarkBadge01Icon);
export const DownloadIcon = icon(Download01Icon);
export const SlidersHorizontalIcon2 = icon(SlidersHorizontalIcon);
export const FilterIcon2 = icon(FilterIcon);
export const RefreshIcon = icon(Refresh01Icon);
export const CopyIcon = icon(Copy01Icon);
export const SettingsIcon = icon(Settings01Icon);

// ─── Content ──────────────────────────────────────────────────────────────────
export const VideoIcon = icon(Video01Icon);
export const FileTextIcon = icon(Note01Icon);
export const AlertTriangleIcon = icon(Alert01Icon);
export const InfoIcon = icon(InformationCircleIcon);
export const PercentIcon2 = icon(PercentIcon);

// ─── Contact / Location ───────────────────────────────────────────────────────
export const PhoneIcon = icon(CallIcon);
export const ClockIcon = icon(Clock01Icon);
export const MapPinIcon2 = icon(MapPinIcon);
export const MailIcon = icon(Mail01Icon);

// ─── People ───────────────────────────────────────────────────────────────────
export const UserIcon = icon(User03Icon);
export const UserAddIcon = icon(UserAdd01Icon);
export const UserCircleIcon2 = icon(UserCircleIcon);
export const UserEditIcon2 = icon(UserEdit01Icon);

// ─── Misc ─────────────────────────────────────────────────────────────────────
export const WeightIcon2 = icon(WeightIcon);
export const RulerIcon2 = icon(RulerIcon);
export const CakeIcon = icon(CakeSliceIcon);
export const SunIcon = icon(Sun01Icon);
export const MoonIcon = icon(Moon01Icon);
export const SadIcon = icon(Sad01Icon);
export const ArrowUpDownIcon2 = icon(ArrowUpDownIcon);
export const EyeIcon2 = icon(EyeIcon);
export const EyeOffIcon = icon(ViewOffSlashIcon);
export const SendIcon = icon(SentIcon);
export const CheckIcon = icon(Tick01Icon);
export const SortIcon = icon(SortingIcon);
export const HistoryIcon = icon(Clock01Icon);
