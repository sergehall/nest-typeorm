type Message = {
  message_id: number;
  from: {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name: string | undefined;
    username: string;
    language_code: string;
  };
  chat: {
    id: number;
    first_name: string;
    last_name: string | undefined;
    username: string;
    type: 'private' | 'group' | 'supergroup' | 'channel';
  };
  date: number;
  text: string;
};

export type PayloadTelegramMessageType = {
  update_id: number;
  message: Message;
};
