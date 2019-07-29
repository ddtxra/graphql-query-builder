import { HttpClient } from '@angular/common/http';
import { Component, OnInit, Injectable } from '@angular/core';
import { FormBuilder, FormControl } from '@angular/forms';
import { QueryBuilderConfig } from 'angular2-query-builder';
import {SelectionModel} from '@angular/cdk/collections';
import {FlatTreeControl} from '@angular/cdk/tree';
import {MatTreeFlatDataSource, MatTreeFlattener} from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';
export class TodoItemNode {
  children: TodoItemNode[];
  item: string;
}
export class TodoItemFlatNode {
  item: string;
  level: number;
  expandable: boolean;
}

var TREE_DATA = {
  Groceries: {
    'Almond Meal flour': null,
    'Organic eggs': null,
    'Protein Powder': null,
    Fruits: {
      Apple: null,
      Berries: ['Blueberry', 'Raspberry'],
      Orange: null
    }
  },
  Reminders: [
    'Cook dinner',
    'Read the Material Design spec',
    'Upgrade Application to Angular'
  ]
};



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public editorOptions = {language: 'graphql'};
  public queryCtrl: FormControl;
  public currentConfig: QueryBuilderConfig = { fields: {} };
  public query: any = { rules: [] };
  public graphqlSchema: any;
  public graphqlSchemaRoot;
  public graphqlSelectedDocument;

  public queryFields = [];
  public graphqlQuery;

  constructor(private httpClient: HttpClient) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
      this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
    this.dataSource.data = this.buildFileTree(TREE_DATA, 0);
  }
  ngOnInit() {
    this.loadData();
  }


  computeGraphQLQuery() {
     let graphqlCoreQuery = "";
     let graphqlQueryPrefix = `query {\n  labo(\n   where: {\n`
     let graphqlQuerySuffix = `        \n   }\n ) {
      patient {
        uid: unite_id
        first_name
        last_name
    }
    eds_id
    careunit_mnemo
    sample_date
    validation_date
    material_label
    dosage_label
    labo_value: value_str
     }   \n}`;
     this.query.rules.forEach(r => {
      graphqlCoreQuery += ("        " + r.field + "_" + r.operator + ": \""  + r.value + "\"\n");
    });
    this.graphqlQuery = graphqlQueryPrefix + graphqlCoreQuery + graphqlQuerySuffix;
  }

  documentChange(event) {
    var typeName = event.type.ofType.name;
    this.graphqlSelectedDocument = this.graphqlSchema.filter(gs => gs.name == typeName)[0];
    var scalarTypes = this.graphqlSelectedDocument.fields.filter(f => f.type.kind == "SCALAR" || f.type.kind == "LIST");
    console.log(scalarTypes);
    var objectTypes = this.graphqlSelectedDocument.fields.filter(f => !(f.type.kind == "SCALAR" || f.type.kind == "LIST"));
    console.log(objectTypes);
    this.dataSource.data = this.buildFileTree(this.graphqlSelectedDocument.fields.map(f => {
      if(f.type.kind == "SCALAR" || (f.type.ofType && f.type.ofType.kind == "SCALAR")) return f.name
      else {
        var object = {};
        object[f.name] = ["paf", "pouf"]
        return object;
      }    
    }), 0);
  }

  buildFileTree(obj: {[key: string]: any}, level: number): TodoItemNode[] {
    return Object.keys(obj).reduce<TodoItemNode[]>((accumulator, key) => {
      const value = obj[key];
      const node = new TodoItemNode();
      node.item = key;
      if (value != null) {
        if (typeof value === 'object') {
          node.children = this.buildFileTree(value, level + 1);
        } else {
          node.item = value;
        }
      }
      return accumulator.concat(node);
    }, []);
  }

  getConfig(): QueryBuilderConfig {
    const config: QueryBuilderConfig = { entities: {}, fields: {} }
    if (this.graphqlSchema) {
      const whereQuery = this.graphqlSchema.filter(gs => gs.name.indexOf('WhereQuery') !== -1);
      whereQuery.forEach(element => {
        const name = element.name.replace('WhereQuery', '').toLowerCase();
        config.entities[name] = {name: name};
        element.inputFields.forEach(ifield => {
          const attributeName = ifield.name;
          if (attributeName.indexOf('_in') !== -1) {
            const attName = attributeName.replace('_in', '');
            config.fields[attName] = { name: attName, type: 'string', operators: ['in'], 'entity' : name};
          } else if (attributeName.indexOf('_match') !== -1) {
            const attName = attributeName.replace('_match', '');
            config.fields[attName] = { name: attName, type: 'string', operators: ['match'], 'entity' : name};
          } else if (attributeName.indexOf('_eq') !== -1) {
            const attName = attributeName.replace('_eq', '');
            config.fields[attName] = { name: attName, type: 'string', operators: ['eq'], 'entity' : name};
          } else if (attributeName.indexOf('_gte') !== -1) {
            const attName = attributeName.replace('_gte', '');
            config.fields[attName] = { name: attName, type: 'string', operators: ['gte'], 'entity' : name};
          } else if (attributeName.indexOf('_lt') !== -1) {
            const attName = attributeName.replace('_lt', '');
            config.fields[attName] = { name: attName, type: 'string', operators: ['lt'], 'entity' : name};
          } else if (attributeName.indexOf('_lte') !== -1) {
            const attName = attributeName.replace('_lte', '');
            config.fields[attName] = { name: attName, type: 'string', operators: ['lte'], 'entity' : name};
          }
        });
      });
    }
    return config;
  }

  public loadData() {
    this.httpClient.get("assets/schema.json")
      .subscribe(data$ => {

        console.log(data$['data'].__schema)
        this.graphqlSchemaRoot = this.graphqlSchema = data$['data'].__schema.types[0];
        this.graphqlSchema = data$['data'].__schema.types;

        TREE_DATA = this.graphqlSchemaRoot['fields'].map(field => {
          field.name
        });
        TREE_DATA = {
          Groceries: {
            'Almond Meal flour': null,
            'Organic eggs': null,
            'Protein Powder': null,
            Fruits: {
              Apple: null,
              Berries: ['Blueberry', 'Raspberry'],
              Orange: null
            }
          },
          Reminders: [
            'Cook dinner',
            'Read the Material Design spec',
            'Upgrade Application to Angular'
          ]
        }
        this.currentConfig = this.getConfig();
        this.query = {
          condition: 'and',
          rules: [
            {
              field: 'material_label',
              operator: 'in',
              value: 'frot. anal',
              entity: 'labo',
            },
            {
              field: 'careunit_mnemo',
              operator: 'in',
              value: 'PC-COL',
              entity: 'labo',
            },
            {
              field: 'sample_date',
              operator: 'gte',
              value: '01.05.2019',
              entity: 'labo'
            }
          ]
        }
        this.computeGraphQLQuery();
      })
  }

  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: TodoItemFlatNode | null = null;

  /** The new item's name */
  newItemName = '';

  treeControl: FlatTreeControl<TodoItemFlatNode>;

  treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;

  dataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;

  /** The selection for checklist */
  checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);

  getLevel = (node: TodoItemFlatNode) => node.level;

  isExpandable = (node: TodoItemFlatNode) => node.expandable;

  getChildren = (node: TodoItemNode): TodoItemNode[] => node.children;

  hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.item === '';

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: TodoItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item === node.item
        ? existingNode
        : new TodoItemFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.expandable = !!node.children;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  /** Whether all the descendants of the node are selected. */
  descendantsAllSelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    return descAllSelected;
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: TodoItemFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    // Force update for the parent
    descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    this.checkAllParentsSelection(node);
  }

  /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
  todoLeafItemSelectionToggle(node: TodoItemFlatNode): void {
    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
  }

  /* Checks all the parents when a leaf node is selected/unselected */
  checkAllParentsSelection(node: TodoItemFlatNode): void {
    let parent: TodoItemFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  /** Check root node checked state and change it accordingly */
  checkRootNodeSelection(node: TodoItemFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.every(child =>
      this.checklistSelection.isSelected(child)
    );
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  /* Get the parent node of a node */
  getParentNode(node: TodoItemFlatNode): TodoItemFlatNode | null {
    const currentLevel = this.getLevel(node);

    if (currentLevel < 1) {
      return null;
    }

    const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

    for (let i = startIndex; i >= 0; i--) {
      const currentNode = this.treeControl.dataNodes[i];

      if (this.getLevel(currentNode) < currentLevel) {
        return currentNode;
      }
    }
    return null;
  }


}