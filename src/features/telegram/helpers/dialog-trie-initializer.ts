import { Trie } from './self-trie';
import { DialogsSets } from './dialogs-sets';

export class DialogTrieInitializer {
  static initializeTrie(dialogSets: DialogsSets): Trie<string> {
    const trie = new Trie<string>();
    for (const [responses, response] of dialogSets) {
      const phrase = responses.join(' ').toLowerCase(); // Putting words together
      trie.insert(phrase, response); // Insert the phrase into Trie
    }
    return trie;
  }
}
