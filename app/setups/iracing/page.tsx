import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SetupPage } from "@/components/setup-page"

const iRacingLogo = (
  <div className="w-16 h-16 flex-shrink-0">
    <svg viewBox="0 0 100 100" className="w-full h-full">
      <rect x="0" y="0" width="50" height="100" fill="#CC0000" />
      <rect x="50" y="0" width="50" height="100" fill="#0033A0" />
      <path
        d="M50 15 L50 85 M30 30 L50 15 L70 30 M35 45 L65 45 M30 70 L50 85 L70 70"
        stroke="white"
        strokeWidth="6"
        fill="none"
      />
      <circle cx="50" cy="35" r="8" fill="white" />
    </svg>
  </div>
)

const filters = {
  filter1: {
    label: "Classes",
    options: [
      { value: "gt3", label: "GT3" },
      { value: "gt4", label: "GT4" },
      { value: "lmp2", label: "LMP2" },
      { value: "lmp3", label: "LMP3" },
      { value: "hypercar", label: "Hypercar" },
      { value: "tcr", label: "TCR" },
      { value: "formula", label: "Formula" },
      { value: "stock", label: "Stock Car" },
    ],
  },
  filter2: {
    label: "Cars",
    options: [
      { value: "ferrari-296", label: "Ferrari 296 GT3" },
      { value: "porsche-992", label: "Porsche 992 GT3 R" },
      { value: "bmw-m4", label: "BMW M4 GT3" },
      { value: "mercedes-amg", label: "Mercedes AMG GT3" },
      { value: "lamborghini-evo2", label: "Lamborghini Huracan GT3 EVO2" },
      { value: "aston-martin", label: "Aston Martin Vantage GT3" },
      { value: "mclaren-720s", label: "McLaren 720S GT3" },
      { value: "audi-r8", label: "Audi R8 LMS GT3" },
    ],
  },
  filter3: {
    label: "Tracks",
    options: [
      { value: "spa", label: "Spa-Francorchamps" },
      { value: "monza", label: "Monza" },
      { value: "nurburgring", label: "Nürburgring" },
      { value: "suzuka", label: "Suzuka" },
      { value: "laguna-seca", label: "Laguna Seca" },
      { value: "watkins-glen", label: "Watkins Glen" },
      { value: "imola", label: "Imola" },
      { value: "barcelona", label: "Barcelona" },
    ],
  },
  filter4: {
    label: "Season",
    options: [
      { value: "2025s1", label: "2025 Season 1" },
      { value: "2024s4", label: "2024 Season 4" },
      { value: "2024s3", label: "2024 Season 3" },
      { value: "2024s2", label: "2024 Season 2" },
    ],
  },
  filter5: {
    label: "Week",
    options: [
      { value: "week1", label: "Week 1" },
      { value: "week2", label: "Week 2" },
      { value: "week3", label: "Week 3" },
      { value: "week4", label: "Week 4" },
      { value: "week5", label: "Week 5" },
      { value: "week6", label: "Week 6" },
      { value: "week7", label: "Week 7" },
      { value: "week8", label: "Week 8" },
      { value: "week9", label: "Week 9" },
      { value: "week10", label: "Week 10" },
      { value: "week11", label: "Week 11" },
      { value: "week12", label: "Week 12" },
    ],
  },
}

const sampleSetups = [
  {
    id: "1",
    game: "iRacing",
    car: "Ferrari 296 GT3",
    track: "Spa-Francorchamps",
    season: "2025 S1",
    week: "Week 1",
    series: "IMSA GT3",
    lapTime: "2:16.542",
  },
  {
    id: "2",
    game: "iRacing",
    car: "Porsche 992 GT3 R",
    track: "Monza",
    season: "2025 S1",
    week: "Week 2",
    series: "GT Sprint",
    lapTime: "1:46.231",
  },
  {
    id: "3",
    game: "iRacing",
    car: "BMW M4 GT3",
    track: "Nürburgring GP",
    season: "2025 S1",
    week: "Week 1",
    series: "VRS GT Sprint",
    lapTime: "1:52.876",
  },
  {
    id: "4",
    game: "iRacing",
    car: "Lamborghini Huracan GT3 EVO2",
    track: "Suzuka",
    season: "2024 S4",
    week: "Week 8",
    series: "IMSA GT3",
    lapTime: "1:58.104",
  },
  {
    id: "5",
    game: "iRacing",
    car: "Mercedes AMG GT3",
    track: "Laguna Seca",
    season: "2024 S4",
    week: "Week 10",
    series: "GT Endurance",
    lapTime: "1:22.567",
  },
  {
    id: "6",
    game: "iRacing",
    car: "Audi R8 LMS GT3 EVO II",
    track: "Barcelona",
    season: "2024 S4",
    week: "Week 5",
    series: "IMSA GT3",
    lapTime: "1:58.104",
  },
  {
    id: "7",
    game: "iRacing",
    car: "Aston Martin Vantage GT3",
    track: "Paul Ricard",
    season: "2024 S4",
    week: "Week 3",
    series: "IMSA GT3",
    lapTime: "1:58.104",
  },
  {
    id: "8",
    game: "iRacing",
    car: "McLaren 720S GT3 EVO",
    track: "Nürburgring",
    season: "2024 S4",
    week: "Week 7",
    series: "IMSA GT3",
    lapTime: "1:58.104",
  },
  {
    id: "9",
    game: "iRacing",
    car: "Audi R8 LMS GT3 EVO II",
    track: "Barcelona",
    season: "2024 S4",
    week: "Week 2",
    series: "IMSA GT3",
    lapTime: "1:58.104",
  },
  {
    id: "10",
    game: "iRacing",
    car: "Audi R8 LMS GT3 EVO II",
    track: "Nürburgring",
    season: "2024 S4",
    week: "Week 6",
    series: "IMSA GT3",
    lapTime: "1:58.104",
  },
  {
    id: "11",
    game: "iRacing",
    car: "Audi R8 LMS GT3 EVO II",
    track: "Barcelona",
    season: "2024 S4",
    week: "Week 4",
    series: "IMSA GT3",
    lapTime: "1:58.104",
  },
  {
    id: "12",
    game: "iRacing",
    car: "Audi R8 LMS GT3 EVO II",
    track: "Barcelona",
    season: "2024 S4",
    week: "Week 1",
    series: "IMSA GT3",
    lapTime: "1:58.104",
  },
]

export default function IRacingPage() {
  return (
    <div className="bg-[#1A191E]">
      <Navbar />
     <SetupPage
        game="iracing"
        title="iRacing"
        logo="/images/logos/iRacing.jpg"
        heroImage="/images/cars/HYMO_Livery_GT3_LMU.png"
        filters={filters}
        setups={sampleSetups}
      />
      <Footer />
    </div>
  )
}
