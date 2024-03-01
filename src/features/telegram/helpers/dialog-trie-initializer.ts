import { Trie } from './self-trie';
import { dialogsSets } from './dialogs-sets';

export class DialogTrieInitializer {
  static initializeTrie(): Trie<string> {
    const trie = new Trie<string>();
    for (const [phrases, response] of dialogsSets) {
      for (const phrase of phrases) {
        const key = phrase.toLowerCase();
        trie.insert(key, response);
      }
    }
    return trie;
  }
}
