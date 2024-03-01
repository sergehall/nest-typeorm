class TrieNode<T> {
  children: Map<string, TrieNode<T>>;
  value?: T;

  constructor() {
    this.children = new Map();
    this.value = undefined; // Изменяем значение по умолчанию на undefined
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

  // Новый метод для поиска префикса
  searchPrefix(prefix: string): T | undefined {
    let node = this.root;
    for (const char of prefix) {
      if (!node.children.has(char)) {
        return undefined;
      }
      node = node.children.get(char)!;
    }
    return node.value;
  }
}
