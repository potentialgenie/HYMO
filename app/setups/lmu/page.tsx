import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SetupPage } from "@/components/setup-page"

const LMULogo = (
  <div className="w-16 h-16 flex-shrink-0 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
    <span className="text-white font-bold text-xl">LMU</span>
  </div>
)

const filters = {
  filter1: {
    label: "Classes",
    options: [
      { value: "hypercar", label: "Hypercar" },
      { value: "lmp2", label: "LMP2" },
      { value: "lmgt3", label: "LMGT3" },
      { value: "gtp", label: "GTP" },
    ],
  },
  filter2: {
    label: "Cars",
    options: [
      { value: "ferrari-499p", label: "Ferrari 499P" },
      { value: "toyota-gr010", label: "Toyota GR010 Hybrid" },
      { value: "porsche-963", label: "Porsche 963" },
      { value: "peugeot-9x8", label: "Peugeot 9X8" },
      { value: "cadillac-vr", label: "Cadillac V-Series.R" },
      { value: "bmw-mhybrid", label: "BMW M Hybrid V8" },
      { value: "lamborghini-sc63", label: "Lamborghini SC63" },
      { value: "alpine-a424", label: "Alpine A424" },
      { value: "oreca-07", label: "Oreca 07 LMP2" },
    ],
  },
  filter3: {
    label: "Tracks",
    options: [
      { value: "le-mans", label: "Circuit de la Sarthe" },
      { value: "spa", label: "Spa-Francorchamps" },
      { value: "monza", label: "Monza" },
      { value: "imola", label: "Imola" },
      { value: "fuji", label: "Fuji Speedway" },
      { value: "bahrain", label: "Bahrain" },
      { value: "sebring", label: "Sebring" },
      { value: "portimao", label: "Portimao" },
      { value: "qatar", label: "Lusail" },
    ],
  },
  filter4: {
    label: "Conditions",
    options: [
      { value: "day-dry", label: "Day - Dry" },
      { value: "day-wet", label: "Day - Wet" },
      { value: "night-dry", label: "Night - Dry" },
      { value: "night-wet", label: "Night - Wet" },
      { value: "transition", label: "Day/Night Transition" },
    ],
  },
  filter5: {
    label: "Type",
    options: [
      { value: "race", label: "Race Setup" },
      { value: "quali", label: "Qualifying Setup" },
      { value: "endurance", label: "Endurance Setup" },
      { value: "sprint", label: "Sprint Setup" },
    ],
  },
}

const sampleSetups = [
  {
    id: "1",
    game: "LMU",
    car: "Ferrari 499P",
    track: "Circuit de la Sarthe",
    season: "2024",
    series: "WEC Hypercar",
    lapTime: "3:24.567",
  },
  {
    id: "2",
    game: "LMU",
    car: "Toyota GR010 Hybrid",
    track: "Spa-Francorchamps",
    season: "2024",
    series: "WEC Hypercar",
    lapTime: "2:02.341",
  },
  {
    id: "3",
    game: "LMU",
    car: "Porsche 963",
    track: "Monza",
    season: "2024",
    series: "WEC Hypercar",
    lapTime: "1:34.892",
  },
  {
    id: "4",
    game: "LMU",
    car: "Cadillac V-Series.R",
    track: "Sebring",
    season: "2024",
    series: "IMSA GTP",
    lapTime: "1:46.123",
  },
  {
    id: "5",
    game: "LMU",
    car: "BMW M Hybrid V8",
    track: "Fuji Speedway",
    season: "2024",
    series: "WEC Hypercar",
    lapTime: "1:29.456",
  },
  {
    id: "6",
    game: "LMU",
    car: "Oreca 07 LMP2",
    track: "Bahrain",
    season: "2024",
    series: "WEC LMP2",
    lapTime: "1:42.789",
  },
  {
    id: "7",
    game: "LMU",
    car: "Lamborghini SC63",
    track: "Imola",
    season: "2024",
    series: "WEC Hypercar",
    lapTime: "1:31.234",
  },
]

export default function LMUPage() {
  return (
    <div className="bg-[#1A191E]">
      <Navbar />
      <SetupPage
        game="lmu"
        title="Le Mans Ultimate"
        logo="/images/logos/lmu_horz_primary_white_logo.png"
        heroImage="/images/cars/HYMO_Livery_GT3_LMU.png"
        filters={filters}
        setups={sampleSetups}
      />
      <Footer />
    </div>
  )
}
