import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SetupPage } from "@/components/setup-page"

const filters = {
  filter1: {
    label: "Classes",
    options: [
      { value: "gt3", label: "GT3" },
      { value: "gt4", label: "GT4" },
      { value: "gtc", label: "GTC" },
      { value: "tcx", label: "TCX" },
    ],
  },
  filter2: {
    label: "Cars",
    options: [
      { value: "ferrari-296", label: "Ferrari 296 GT3" },
      { value: "porsche-992", label: "Porsche 992 GT3 R" },
      { value: "bmw-m4", label: "BMW M4 GT3" },
      { value: "mercedes-amg", label: "Mercedes AMG GT3 EVO" },
      { value: "lamborghini-evo2", label: "Lamborghini Huracan GT3 EVO2" },
      { value: "aston-martin", label: "Aston Martin Vantage GT3" },
      { value: "mclaren-720s", label: "McLaren 720S GT3 EVO" },
      { value: "audi-r8", label: "Audi R8 LMS GT3 EVO II" },
      { value: "bentley", label: "Bentley Continental GT3" },
      { value: "ford-mustang", label: "Ford Mustang GT3" },
    ],
  },
  filter3: {
    label: "Tracks",
    options: [
      { value: "spa", label: "Spa-Francorchamps" },
      { value: "monza", label: "Monza" },
      { value: "nurburgring", label: "Nürburgring" },
      { value: "brands-hatch", label: "Brands Hatch" },
      { value: "silverstone", label: "Silverstone" },
      { value: "paul-ricard", label: "Paul Ricard" },
      { value: "zandvoort", label: "Zandvoort" },
      { value: "barcelona", label: "Barcelona" },
      { value: "misano", label: "Misano" },
      { value: "imola", label: "Imola" },
      { value: "kyalami", label: "Kyalami" },
      { value: "valencia", label: "Valencia" },
    ],
  },
  filter4: {
    label: "Conditions",
    options: [
      { value: "dry", label: "Dry" },
      { value: "wet", label: "Wet" },
      { value: "mixed", label: "Mixed" },
    ],
  },
  filter5: {
    label: "Type",
    options: [
      { value: "race", label: "Race Setup" },
      { value: "quali", label: "Qualifying Setup" },
      { value: "safe", label: "Safe Setup" },
      { value: "aggressive", label: "Aggressive Setup" },
    ],
  },
}

const sampleSetups = [
  {
    id: "1",
    game: "ACC",
    car: "Ferrari 296 GT3",
    track: "Spa-Francorchamps",
    season: "2024",
    series: "GT World Challenge",
    lapTime: "2:17.234",
  },
  {
    id: "2",
    game: "ACC",
    car: "Porsche 992 GT3 R",
    track: "Monza",
    season: "2024",
    series: "Sprint Cup",
    lapTime: "1:46.892",
  },
  {
    id: "3",
    game: "ACC",
    car: "BMW M4 GT3",
    track: "Brands Hatch",
    season: "2024",
    series: "British GT",
    lapTime: "1:22.456",
  },
  {
    id: "4",
    game: "ACC",
    car: "Lamborghini Huracan GT3 EVO2",
    track: "Silverstone",
    season: "2024",
    series: "Endurance Cup",
    lapTime: "1:58.321",
  },
  {
    id: "5",
    game: "ACC",
    car: "Mercedes AMG GT3 EVO",
    track: "Nürburgring",
    season: "2024",
    series: "GT World Challenge",
    lapTime: "1:53.789",
  },
  {
    id: "6",
    game: "ACC",
    car: "Ford Mustang GT3",
    track: "Paul Ricard",
    season: "2024",
    series: "Sprint Cup",
    lapTime: "1:53.102",
  },
]

export default function ACCPage() {
  return (
    <div className="bg-[#1A191E]">
      <Navbar />
      <SetupPage
        game="acc"
        title="Assetto Corsa Competizione"
        logo="/images/logos/Assetto_corsa_competizione_logo_135.png"
        heroImage="/images/cars/HYMO_Livery_GT3_LMU.png"
        filters={filters}
        setups={sampleSetups}
      />
      <Footer />
    </div>
  )
}
