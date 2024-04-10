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

type MyChatMember = {
  chat: {
    id: number;
    first_name: string;
    username: string;
    type: 'private' | 'group' | 'supergroup' | 'channel'; // Adjust the enums as needed
  };
  from: {
    id: number;
    is_bot: boolean;
    first_name: string;
    username: string;
    language_code: string;
  };
  date: number;
  old_chat_member: {
    user: any; // Replace `any` with a more specific type if available
    status:
      | 'member'
      | 'administrator'
      | 'creator'
      | 'restricted'
      | 'left'
      | 'kicked'; // Adjust the enums as needed
  };
  new_chat_member: {
    user: any; // Replace `any` with a more specific type if available
    status:
      | 'member'
      | 'administrator'
      | 'creator'
      | 'restricted'
      | 'left'
      | 'kicked'; // Adjust the enums as needed
    until_date?: number;
  };
};

export type PayloadTelegramMessageType = {
  update_id: number;
  message: Message;
  my_chat_member: MyChatMember;
  entities: any[]; // Replace `any` with a more specific type if available
  link_preview_options: { url: string; domain: string };
};
