export const SUBJECT_COLORS: Record<
  string,
  { bg: string; text: string; badge: string; bar: string }
> = {
  Matemática: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    badge: "bg-blue-100 text-blue-800",
    bar: "bg-blue-700",
  },
  Português: {
    bg: "bg-green-50",
    text: "text-green-700",
    badge: "bg-green-100 text-green-800",
    bar: "bg-green-700",
  },
  Química: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    badge: "bg-purple-100 text-purple-800",
    bar: "bg-purple-700",
  },
  Física: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    badge: "bg-orange-100 text-orange-800",
    bar: "bg-orange-700",
  },
  História: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-800",
    bar: "bg-amber-700",
  },
  Geografia: {
    bg: "bg-teal-50",
    text: "text-teal-700",
    badge: "bg-teal-100 text-teal-800",
    bar: "bg-teal-700",
  },
  Inglês: {
    bg: "bg-red-50",
    text: "text-red-700",
    badge: "bg-red-100 text-red-800",
    bar: "bg-red-700",
  },
  Biologia: {
    bg: "bg-lime-50",
    text: "text-lime-700",
    badge: "bg-lime-100 text-lime-800",
    bar: "bg-lime-700",
  },
};

export const SUBJECTS = [
  "Matemática",
  "Português",
  "Química",
  "Física",
  "História",
  "Geografia",
  "Inglês",
  "Biologia",
] as const;
