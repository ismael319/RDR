// ── Icons (estilo refinado: linhas arredondadas, duotone sutil) ──
const ICO = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round"
};
const BackIcon = ({
  size = 20
}) => /*#__PURE__*/React.createElement("svg", Object.assign({
  width: size,
  height: size
}, ICO, {
  strokeWidth: "2.5",
  viewBox: "0 0 24 24"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "15 18 9 12 15 6"
}));
const PlusIcon = ({
  size = 22
}) => /*#__PURE__*/React.createElement("svg", Object.assign({
  width: size,
  height: size
}, ICO, {
  strokeWidth: "2.5",
  viewBox: "0 0 24 24"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "9",
  opacity: "0.18",
  fill: "currentColor",
  stroke: "none"
}), /*#__PURE__*/React.createElement("line", {
  x1: "12",
  y1: "7.5",
  x2: "12",
  y2: "16.5"
}), /*#__PURE__*/React.createElement("line", {
  x1: "7.5",
  y1: "12",
  x2: "16.5",
  y2: "12"
}));
const FolderIcon = () => /*#__PURE__*/React.createElement("svg", Object.assign({
  width: "20",
  height: "20"
}, ICO, {
  strokeWidth: "2",
  viewBox: "0 0 24 24"
}), /*#__PURE__*/React.createElement("path", {
  d: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
  fillOpacity: "0.14",
  fill: "currentColor"
}));
const CheckIcon = ({
  size = 14
}) => /*#__PURE__*/React.createElement("svg", Object.assign({
  width: size,
  height: size
}, ICO, {
  strokeWidth: "2.6",
  viewBox: "0 0 24 24"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "20 6 9 17 4 12"
}));
const TrashIcon = ({
  size = 16
}) => /*#__PURE__*/React.createElement("svg", Object.assign({
  width: size,
  height: size
}, ICO, {
  strokeWidth: "2",
  viewBox: "0 0 24 24"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "3 6 5 6 21 6"
}), /*#__PURE__*/React.createElement("path", {
  d: "M19 6l-1 14H6L5 6",
  fillOpacity: "0.12",
  fill: "currentColor"
}), /*#__PURE__*/React.createElement("path", {
  d: "M10 11v6"
}), /*#__PURE__*/React.createElement("path", {
  d: "M14 11v6"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 6V4h6v2"
}));
const CameraIcon = () => /*#__PURE__*/React.createElement("svg", Object.assign({
  width: "22",
  height: "22"
}, ICO, {
  strokeWidth: "2",
  viewBox: "0 0 24 24"
}), /*#__PURE__*/React.createElement("path", {
  d: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "13",
  r: "4",
  fillOpacity: "0.16",
  fill: "currentColor"
}));
const DownloadIcon = () => /*#__PURE__*/React.createElement("svg", Object.assign({
  width: "17",
  height: "17"
}, ICO, {
  strokeWidth: "2",
  viewBox: "0 0 24 24"
}), /*#__PURE__*/React.createElement("path", {
  d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "7 10 12 15 17 10"
}), /*#__PURE__*/React.createElement("line", {
  x1: "12",
  y1: "15",
  x2: "12",
  y2: "3"
}));
const UploadIcon = ({
  size = 17
}) => /*#__PURE__*/React.createElement("svg", Object.assign({
  width: size,
  height: size
}, ICO, {
  strokeWidth: "2",
  viewBox: "0 0 24 24"
}), /*#__PURE__*/React.createElement("path", {
  d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "17 8 12 3 7 8"
}), /*#__PURE__*/React.createElement("line", {
  x1: "12",
  y1: "3",
  x2: "12",
  y2: "15"
}));
const CalendarIcon = ({
  size = 16
}) => /*#__PURE__*/React.createElement("svg", Object.assign({
  width: size,
  height: size
}, ICO, {
  strokeWidth: "2",
  viewBox: "0 0 24 24"
}), /*#__PURE__*/React.createElement("rect", {
  x: "3",
  y: "4",
  width: "18",
  height: "18",
  rx: "3",
  fillOpacity: "0.1",
  fill: "currentColor"
}), /*#__PURE__*/React.createElement("line", {
  x1: "16",
  y1: "2",
  x2: "16",
  y2: "6"
}), /*#__PURE__*/React.createElement("line", {
  x1: "8",
  y1: "2",
  x2: "8",
  y2: "6"
}), /*#__PURE__*/React.createElement("line", {
  x1: "3",
  y1: "10",
  x2: "21",
  y2: "10"
}));
const ClockIcon = () => /*#__PURE__*/React.createElement("svg", Object.assign({
  width: "16",
  height: "16"
}, ICO, {
  strokeWidth: "2",
  viewBox: "0 0 24 24"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "9",
  fillOpacity: "0.1",
  fill: "currentColor"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "12 7 12 12 15.5 14"
}));
const ChevronRight = () => /*#__PURE__*/React.createElement("svg", Object.assign({
  width: "16",
  height: "16"
}, ICO, {
  strokeWidth: "2.5",
  viewBox: "0 0 24 24"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "9 18 15 12 9 6"
}));
const ChevronDown = () => /*#__PURE__*/React.createElement("svg", Object.assign({
  width: "16",
  height: "16"
}, ICO, {
  strokeWidth: "2.5",
  viewBox: "0 0 24 24"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "6 9 12 15 18 9"
}));
const ChevronUpIcon = () => /*#__PURE__*/React.createElement("svg", Object.assign({
  width: "13",
  height: "13"
}, ICO, {
  strokeWidth: "2.5",
  viewBox: "0 0 24 24"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "18 15 12 9 6 15"
}));
const LogoutIcon = () => /*#__PURE__*/React.createElement("svg", Object.assign({
  width: "18",
  height: "18"
}, ICO, {
  strokeWidth: "2",
  viewBox: "0 0 24 24"
}), /*#__PURE__*/React.createElement("path", {
  d: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "16 17 21 12 16 7"
}), /*#__PURE__*/React.createElement("line", {
  x1: "21",
  y1: "12",
  x2: "9",
  y2: "12"
}));
const LoginIcon = ({
  size = 18
}) => /*#__PURE__*/React.createElement("svg", Object.assign({
  width: size,
  height: size
}, ICO, {
  strokeWidth: "2.2",
  viewBox: "0 0 24 24"
}), /*#__PURE__*/React.createElement("path", {
  d: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "10 17 15 12 10 7"
}), /*#__PURE__*/React.createElement("line", {
  x1: "15",
  y1: "12",
  x2: "3",
  y2: "12"
}));
const UserIcon = () => /*#__PURE__*/React.createElement("svg", Object.assign({
  width: "18",
  height: "18"
}, ICO, {
  strokeWidth: "2",
  viewBox: "0 0 24 24"
}), /*#__PURE__*/React.createElement("path", {
  d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "7",
  r: "4",
  fillOpacity: "0.14",
  fill: "currentColor"
}));
const UsersIcon = () => /*#__PURE__*/React.createElement("svg", Object.assign({
  width: "20",
  height: "20"
}, ICO, {
  strokeWidth: "2",
  viewBox: "0 0 24 24"
}), /*#__PURE__*/React.createElement("path", {
  d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "9",
  cy: "7",
  r: "4",
  fillOpacity: "0.14",
  fill: "currentColor"
}), /*#__PURE__*/React.createElement("path", {
  d: "M23 21v-2a4 4 0 0 0-3-3.87"
}), /*#__PURE__*/React.createElement("path", {
  d: "M16 3.13a4 4 0 0 1 0 7.75"
}));
const ShieldIcon = () => /*#__PURE__*/React.createElement("svg", Object.assign({
  width: "20",
  height: "20"
}, ICO, {
  strokeWidth: "2",
  viewBox: "0 0 24 24"
}), /*#__PURE__*/React.createElement("path", {
  d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  fillOpacity: "0.16",
  fill: "currentColor"
}));
const FilterIcon = ({
  size = 14
}) => /*#__PURE__*/React.createElement("svg", Object.assign({
  width: size,
  height: size
}, ICO, {
  strokeWidth: "2.2",
  viewBox: "0 0 24 24"
}), /*#__PURE__*/React.createElement("polygon", {
  points: "4 5 20 5 14 13 14 19 10 21 10 13 4 5",
  fillOpacity: "0.12",
  fill: "currentColor"
}));
const EditIcon = ({
  size = 14
}) => /*#__PURE__*/React.createElement("svg", Object.assign({
  width: size,
  height: size
}, ICO, {
  strokeWidth: "2.1",
  viewBox: "0 0 24 24"
}), /*#__PURE__*/React.createElement("path", {
  d: "M11 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"
}), /*#__PURE__*/React.createElement("path", {
  d: "M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z",
  fillOpacity: "0.14",
  fill: "currentColor"
}));
const XIcon = ({
  size = 14
}) => /*#__PURE__*/React.createElement("svg", Object.assign({
  width: size,
  height: size
}, ICO, {
  strokeWidth: "2.4",
  viewBox: "0 0 24 24"
}), /*#__PURE__*/React.createElement("line", {
  x1: "18",
  y1: "6",
  x2: "6",
  y2: "18"
}), /*#__PURE__*/React.createElement("line", {
  x1: "6",
  y1: "6",
  x2: "18",
  y2: "18"
}));
const EyeIcon = ({
  size = 15
}) => /*#__PURE__*/React.createElement("svg", Object.assign({
  width: size,
  height: size
}, ICO, {
  strokeWidth: "2",
  viewBox: "0 0 24 24"
}), /*#__PURE__*/React.createElement("path", {
  d: "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "3",
  fillOpacity: "0.2",
  fill: "currentColor"
}));
const AlertCircleIcon = () => /*#__PURE__*/React.createElement("svg", Object.assign({
  width: "20",
  height: "20"
}, ICO, {
  strokeWidth: "2",
  viewBox: "0 0 24 24"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "10",
  fillOpacity: "0.14",
  fill: "currentColor"
}), /*#__PURE__*/React.createElement("line", {
  x1: "12",
  y1: "8",
  x2: "12",
  y2: "12"
}), /*#__PURE__*/React.createElement("line", {
  x1: "12",
  y1: "16",
  x2: "12.01",
  y2: "16"
}));
const ArrowUpIcon = ({
  size = 12
}) => /*#__PURE__*/React.createElement("svg", Object.assign({
  width: size,
  height: size
}, ICO, {
  strokeWidth: "2.4",
  viewBox: "0 0 24 24"
}), /*#__PURE__*/React.createElement("line", {
  x1: "12",
  y1: "19",
  x2: "12",
  y2: "5"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "6 11 12 5 18 11"
}));
const ArrowDownIcon = ({
  size = 12
}) => /*#__PURE__*/React.createElement("svg", Object.assign({
  width: size,
  height: size
}, ICO, {
  strokeWidth: "2.4",
  viewBox: "0 0 24 24"
}), /*#__PURE__*/React.createElement("line", {
  x1: "12",
  y1: "5",
  x2: "12",
  y2: "19"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "6 13 12 19 18 13"
}));
const AlertIcon = () => /*#__PURE__*/React.createElement("svg", Object.assign({
  width: "20",
  height: "20"
}, ICO, {
  strokeWidth: "2",
  viewBox: "0 0 24 24"
}), /*#__PURE__*/React.createElement("path", {
  d: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z",
  fillOpacity: "0.14",
  fill: "currentColor"
}), /*#__PURE__*/React.createElement("line", {
  x1: "12",
  y1: "9",
  x2: "12",
  y2: "13"
}), /*#__PURE__*/React.createElement("line", {
  x1: "12",
  y1: "17",
  x2: "12.01",
  y2: "17"
}));
const PlusCircleIcon = ({
  size = 14
}) => /*#__PURE__*/React.createElement("svg", Object.assign({
  width: size,
  height: size
}, ICO, {
  strokeWidth: "2.2",
  viewBox: "0 0 24 24"
}), /*#__PURE__*/React.createElement("circle", {
  cx: "12",
  cy: "12",
  r: "10",
  fillOpacity: "0.14",
  fill: "currentColor"
}), /*#__PURE__*/React.createElement("line", {
  x1: "12",
  y1: "8",
  x2: "12",
  y2: "16"
}), /*#__PURE__*/React.createElement("line", {
  x1: "8",
  y1: "12",
  x2: "16",
  y2: "12"
}));
const SaveIcon = ({
  size = 14
}) => /*#__PURE__*/React.createElement("svg", Object.assign({
  width: size,
  height: size
}, ICO, {
  strokeWidth: "2.1",
  viewBox: "0 0 24 24"
}), /*#__PURE__*/React.createElement("path", {
  d: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z",
  fillOpacity: "0.12",
  fill: "currentColor"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "17 21 17 13 7 13 7 21"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "7 3 7 8 15 8"
}));
const PrinterIcon = () => /*#__PURE__*/React.createElement("svg", Object.assign({
  width: "14",
  height: "14"
}, ICO, {
  strokeWidth: "2.1",
  viewBox: "0 0 24 24"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "6 9 6 2 18 2 18 9"
}), /*#__PURE__*/React.createElement("path", {
  d: "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2",
  fillOpacity: "0.12",
  fill: "currentColor"
}), /*#__PURE__*/React.createElement("rect", {
  x: "6",
  y: "14",
  width: "12",
  height: "8"
}));
const DocumentIcon = ({
  size = 22
}) => /*#__PURE__*/React.createElement("svg", Object.assign({
  width: size,
  height: size
}, ICO, {
  strokeWidth: "2",
  viewBox: "0 0 24 24"
}), /*#__PURE__*/React.createElement("path", {
  d: "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z",
  fillOpacity: "0.12",
  fill: "currentColor"
}), /*#__PURE__*/React.createElement("polyline", {
  points: "14 2 14 8 20 8"
}), /*#__PURE__*/React.createElement("line", {
  x1: "16",
  y1: "13",
  x2: "8",
  y2: "13"
}), /*#__PURE__*/React.createElement("line", {
  x1: "16",
  y1: "17",
  x2: "8",
  y2: "17"
}));
const DashboardIcon = ({
  size = 22
}) => /*#__PURE__*/React.createElement("svg", Object.assign({
  width: size,
  height: size
}, ICO, {
  strokeWidth: "2",
  viewBox: "0 0 24 24"
}), /*#__PURE__*/React.createElement("rect", {
  x: "3",
  y: "3",
  width: "7",
  height: "7",
  rx: "1.5",
  fillOpacity: "0.16",
  fill: "currentColor"
}), /*#__PURE__*/React.createElement("rect", {
  x: "14",
  y: "3",
  width: "7",
  height: "7",
  rx: "1.5"
}), /*#__PURE__*/React.createElement("rect", {
  x: "14",
  y: "14",
  width: "7",
  height: "7",
  rx: "1.5",
  fillOpacity: "0.16",
  fill: "currentColor"
}), /*#__PURE__*/React.createElement("rect", {
  x: "3",
  y: "14",
  width: "7",
  height: "7",
  rx: "1.5"
}));
const ClipboardIcon = () => /*#__PURE__*/React.createElement("svg", Object.assign({
  width: "16",
  height: "16"
}, ICO, {
  strokeWidth: "2",
  viewBox: "0 0 24 24"
}), /*#__PURE__*/React.createElement("rect", {
  x: "9",
  y: "9",
  width: "13",
  height: "13",
  rx: "2",
  fillOpacity: "0.12",
  fill: "currentColor"
}), /*#__PURE__*/React.createElement("path", {
  d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"
}));
const BarChartIcon = ({
  size = 17
}) => /*#__PURE__*/React.createElement("svg", Object.assign({
  width: size,
  height: size
}, ICO, {
  strokeWidth: "2",
  viewBox: "0 0 24 24"
}), /*#__PURE__*/React.createElement("path", {
  d: "M3 3v18h18"
}), /*#__PURE__*/React.createElement("rect", {
  x: "7",
  y: "13",
  width: "3",
  height: "6",
  fillOpacity: "0.16",
  fill: "currentColor"
}), /*#__PURE__*/React.createElement("rect", {
  x: "12",
  y: "9",
  width: "3",
  height: "10",
  fillOpacity: "0.16",
  fill: "currentColor"
}), /*#__PURE__*/React.createElement("rect", {
  x: "17",
  y: "5",
  width: "3",
  height: "14",
  fillOpacity: "0.16",
  fill: "currentColor"
}));
