import { DialogSets } from '../dialog/sets';
import { Trie } from './self-trie';

export class DialogTrieInitializer {
  static initializeTrie(dialogSets: DialogSets): Trie<string> {
    const trie = new Trie<string>();
    for (const [responses, response] of dialogSets) {
      const phrase = responses.join(' ').toLowerCase(); // Putting words together
      trie.insert(phrase, response); // Insert the phrase into Trie
    }
    return trie;
  }
}
