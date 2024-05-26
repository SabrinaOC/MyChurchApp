
export interface Book {
    id: number,
    name: string,
    description: string
}

export interface Speaker {
    id: number,
    name: string
}
export interface Message {
    id: number,
    title: string,
    url: string,
    date: Date,
    speaker: Speaker,
    book: Book
}

export type NewMessage = Omit<Message, 'id'>