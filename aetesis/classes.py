import json

class Node():
  def __init__(self, name, item_code=None, parent=None):
    self.parent = parent
    self.name = name
    self.item_code = item_code 
    self.children = []
    
  def __repr__(self):
    return str(self.name)

  def __eq__(self, other):
    return self.name == other.name

  def add_child(self, child):
    if child.parent is None:
        child.parent = self
    self.children.append(child)
      
class Attribute():
    def __init__(self, attr, item_code, parent=None):
        self.parent = parent
        self.label = attr.get('attribute')
        self.values = [Node(attr.get('attribute_value'),item_code, self)]
    
    def __repr__(self):
      return str(self.label)

    def add_Value(self, value, item_code):
        self.values.append(Node(value, item_code, self))

    def get_Values(self):
      res = []
      for i in self.values:
        res.append(i.name)
      return res

    def get_node(self, name):
      for i in self.values:
        if i.name == name:
          return i
      return False
    
    def get_parents(self, result=""):
      print(self)
      print(type(self), self.parent.name, self.parent.parent)
      if self.parent.name == 'root': return '/root'
      result += '/' + self.parent.name
      result += self.parent.parent.get_parents(result)
      print('res', result)
      result = result.split('/').pop(0)
      print(result)

      return result
    
    def existing_value(self, value):
      pass
      
class Tree():
# UTILITY METHODS
  
  def __init__(self):
        self.root = Node('root', 'root')

  def __repr__(self):
    return self.print()

  def print(self, start_node=None):
    attrs = self.get_all(start_node)
    string = ""

    if attrs == []:
      return ""
    print(attrs)
      
    for attr in attrs:
      print(attr)
      string += '{ "label": "' + str(attr[0]) + '", "parent": "' + str(attr[0].parent) + '", "values": ['
      for val in attr[1]:
        string += ' {"val": "' + str(val[0])
        if self.get_all(val[0]) == []:
          string += '", "item_code": "' + val[0].item_code 
        string += '", "children": [' + self.print(val[0]) + ']}'
	
        if not val == attr[1][-1]:
          string += ', '
      string += ' ] }'
      if not attr == attrs[-1]:
        string += ', '
    
    return string
    
  def print_in_brackets(self):
    string = "[" + self.print() + "]"
    return string
    	
# GET METHODS
    
  def get_attr(self, attr):
    return self.get_attr_by_label(attr.label)
  
  def get_attr_by_label(self, label, start=None):
    root = start or self.root
    if root.children == []:
      return False
    for attr in root.children:
      if attr.label == label:
        return attr
      for val in attr.values:
        found = self.get_attr_by_label(label, val)
        if found:
          return found
    return False
 
  def get_all(self, start_node=None):
    root = start_node or self.root
    tree = []

    if root.children == []: return []
      
    for attr in root.children:
      branch = [attr, []]
      for val in attr.values:
        current = [val, self.get_all(val)]
        branch[1].append(current)
      tree.append(branch)
    return tree  

  def get_attrs(self, start_node=None):
    root = start_node or self.root
    tree = []

    for attr in root.children:
      tree.append(attr)
      if not attr.values == []:
        for val in attr.values:
          children = self.get_attrs(val)
          tree = tree + children

    return tree
 

# INSERT METHODS
  
  def insert_chain(self, attrs, parent):
    last = parent
    for el in attrs:
      new_attr = self.insert_attribute(el, last)
      last = new_attr.values[0]

  def insert_attribute(self, attr, parent=None):
    if isinstance(attr, Attribute):
      new_attr = attr
    else:
      new_attr = Attribute(attr, parent)

    if new_attr.parent is None:
      new_attr.parent = parent or self.root

    new_attr.parent.add_child(new_attr)
    return new_attr

  def insert_variant(self, item_code, var, start_node=None):
    print('call')
    attrs = []
    if not isinstance(var[0], Attribute):
      for el in var:
        attrs.append(Attribute(el, item_code))
    else:
      attrs = var
    to_add = attrs
    start = start_node or self.root
      
    for attr in attrs:
      existing_label = self.get_attr_by_label(attr.label, start)
      if not existing_label:
        return self.insert_chain(to_add, start)
      value = attr.values[0].name
      existing_value = existing_label.get_node(value)
      print('attr', attr, 'e_l', existing_label, 'val', value, 'e_v', existing_value)
      if not existing_value:
        existing_label.add_Value(value, item_code)
        created_node = existing_label.get_node(value)
        to_add.pop(0)
        return self.insert_chain(to_add, created_node)

      start = existing_value
      to_add.pop(0)
      if to_add == []: return
      self.insert_variant(item_code, to_add, start)


def get_tree(variants):
  tree = Tree()

  for v in variants:
    tree.insert_variant(v[0], v[1])
  print('tree', tree.print_in_brackets())
  return tree.print_in_brackets()
