
export interface Book {
    id: number,
    name: string,
    description: string
}

export interface Testament {
    id: number,
    name: string
}

export interface Speaker {
    id: number,
    name: string
}
export interface Message {
    id: number,
    title: string,
    normalized_title: string
    url: string,
    date: Date,
    speaker: Speaker,
    book: Book,
    listened: Boolean,
    note: string,
    isNew: Boolean,
    createdAt: Date,
    messageType: MessageType,
    questions: string
}

export type NewMessage = Omit<Message, 'id'>

export interface MessageFilterOpt {
    speaker: number,
    book: number,
    testament: number,
    dateFrom: Date,
    dateTo: Date
}

export interface MessageType {
    id: number,
    description: string
}