class TrieNode<T> {
  children: Map<string, TrieNode<T>>;
  value?: T;

  constructor() {
    this.children = new Map();
  }
}

export class Trie<T> {
  private root: TrieNode<T>;

  constructor() {
    this.root = new TrieNode<T>();
  }

  insert(key: string, value: T): void {
    let node = this.root;
    for (const char of key) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode<T>());
      }
      node = node.children.get(char)!;
    }
    node.value = value;
  }

  search(key: string): T | undefined {
    let node = this.root;
    for (const char of key) {
      if (!node.children.has(char)) {
        return undefined;
      }
      node = node.children.get(char)!;
    }
    return node.value;
  }

  delete(key: string): boolean {
    let node = this.root;
    const stack: Array<[TrieNode<T>, string]> = [[node, key]];
    let last: [TrieNode<T>, string] | undefined;
    for (const char of key) {
      if (!node.children.has(char)) {
        return false;
      }
      node = node.children.get(char)!;
      stack.push([node, char]);
    }
    if (node.value === undefined) {
      return false;
    }
    node.value = undefined;
    while (stack.length > 0) {
      last = stack.pop();
      if (last && last[0].children.size === 0 && last[0].value === undefined) {
        last[0].children.delete(last[1]);
      } else {
        break;
      }
    }
    return true;
  }

  // Implement searchPrefix method to search for prefixes
  searchPrefix(prefix: string): TrieNode<T> | undefined {
    let node = this.root;
    for (const char of prefix) {
      if (!node.children.has(char)) {
        return undefined;
      }
      node = node.children.get(char)!;
    }
    return node;
  }
}
