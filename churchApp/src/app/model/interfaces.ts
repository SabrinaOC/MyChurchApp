
export interface Book {
    id: number,
    name: string,
    description: string
}
export interface Message {
    id: number,
    // id_speaker: number,
    title: string,
    url: string,
    date: Date,
    // id_book: number,
    Speaker: Speaker,
    Book: Book
}

export interface Speaker {
    id: number,
    name: string
}

export type NewMessage = Omit<Message, 'id'>