import { MaterialDesignIconsIconName } from "@react-native-vector-icons/material-design-icons";

export interface IconInfo {
  id: string;
  name: string;
  icon: MaterialDesignIconsIconName;
}

export const BookTypes: IconInfo[] = [
  {
    id: "paperBook",
    name: "종이책",
    icon: "book-open-blank-variant-outline"
  },
  {
    id: "eBook",
    name: "전자책",
    icon: "cellphone-text"
  },
  {
    id: "audioBook",
    name: "오디오북",
    icon: "headphones"
  }
]

export const Emotions: IconInfo[] = [
  {
    id: "happy",
    name: "행복",
    icon: "emoticon-excited-outline"
  },
  {
    id: "good",
    name: "재밌음",
    icon: "emoticon-happy-outline"
  },
  {
    id: "lol",
    name: "웃김",
    icon: "emoticon-lol-outline"
  },
  {
    id: "soso",
    name: "그럭저럭",
    icon: "emoticon-neutral-outline"
  },
  {
    id: "sad",
    name: "감동",
    icon: "emoticon-cry-outline"
  },
  {
    id: "bad",
    name: "별로",
    icon: "emoticon-angry-outline"
  },
  {
    id: "confuse",
    name: "복잡함",
    icon: "emoticon-confused-outline"
  },
  {
    id: "scary",
    name: "무서움",
    icon: "emoticon-dead-outline"
  },
]

export interface ReviewRow {
  id: number;
  star_rate: number;
  text: string;
  type: string;
  emotion: string;
  write_date: string;
}

export default class Review {
  id: number;
  starRate: number;
  text: string;
  type: IconInfo;
  emotion: IconInfo;
  date: Date;

 getDateString() {
    const year = this.date.getFullYear();
    const month = String(this.date.getMonth() + 1).padStart(2, '0');
    const day = String(this.date.getDate()).padStart(2, '0');

    return `${year}.${month}.${day}`;
  }

  constructor (row: ReviewRow) {
    this.id = row.id;
    this.starRate = row.star_rate;
    this.text = row.text;
    this.type = BookTypes.find(type => type.id===row.type)!;
    this.emotion = Emotions.find(emotion => emotion.id===row.emotion)!;
    this.date = new Date(row.write_date);
  }
}