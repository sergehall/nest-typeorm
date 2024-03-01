import { Trie } from './self-trie';
import { DialogsSets } from './dialogs-sets';

export class DialogTrieInitializer {
  static initializeTrie(dialogSets: DialogsSets): Trie<string> {
    const trie = new Trie<string>();
    // Наполняем Trie фразами из dialogSets
    for (const [responses, response] of dialogSets) {
      for (const phrase of responses) {
        const key = phrase.toLowerCase();
        trie.insert(key, response);
      }
    }
    return trie;
  }
}
