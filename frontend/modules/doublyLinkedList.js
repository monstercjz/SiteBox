// doublyLinkedList.js - 双向链表实现

class Node {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.timestamp = Date.now();
    this.prev = null;
    this.next = null;
  }
}

export class DoublyLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  addLast(key, value) {
    const newNode = new Node(key, value);
    if (this.size === 0) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.prev = this.tail;
      this.tail.next = newNode;
      this.tail = newNode;
    }
    this.size++;
    return newNode;
  }

  removeFirst() {
    if (this.size === 0) {
      return null;
    }
    const removedNode = this.head;
    if (this.size === 1) {
      this.head = null;
      this.tail = null;
    } else {
      this.head = this.head.next;
      this.head.prev = null;
    }
    this.size--;
    return removedNode;
  }

  moveToEnd(node) {
    if (node === this.tail) {
      return;
    }
    if (node === this.head) {
      this.head = this.head.next;
      this.head.prev = null;
    } else {
      node.prev.next = node.next;
      node.next.prev = node.prev;
    }
    node.prev = this.tail;
    node.next = null;
    this.tail.next = node;
    this.tail = node;
  }

  remove(node) {
    if (!node) return;
    if (node === this.head && node === this.tail) {
      this.head = null;
      this.tail = null;
    } else if (node === this.head) {
      this.head = this.head.next;
      this.head.prev = null;
    } else if (node === this.tail) {
      this.tail = node.prev;
      this.tail.next = null;
    } else {
      node.prev.next = node.next;
      node.next.prev = node.prev;
    }
    this.size--;
  }
}