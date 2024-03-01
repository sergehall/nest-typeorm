import { DialogSets } from '../dialog/sets';
import { Trie } from './self-trie';

export class DialogTrieInitializer {
  static initializeTrie(dialogSets: DialogSets): Trie<string> {
    const trie = new Trie<string>();
    for (const [responses, response] of dialogSets) {
      for (const word of responses) {
        trie.insert(word.toLowerCase(), response);
      }
    }
    return trie;
  }
}
