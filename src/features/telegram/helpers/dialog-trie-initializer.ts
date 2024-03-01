import { DialogSets } from '../dialog/sets';
import { Trie } from './self-trie';

export class DialogTrieInitializer {
  static initializeTrie(dialogSets: DialogSets): Trie<string> {
    const trie = new Trie<string>();
    for (const [responses, response] of dialogSets) {
      const phrase = responses.join(' ').toLowerCase(); // Соединяем слова в фразу
      trie.insert(phrase, response);
    }
    return trie;
  }
}
