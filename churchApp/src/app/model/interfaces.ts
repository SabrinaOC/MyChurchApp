export interface Message {
    id: number,
    idSpeaker: number,
    title: string,
    url: string
}

export type NewMessage = Omit<Message, 'id'>