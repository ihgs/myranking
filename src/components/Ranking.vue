<template>
  <div class="ranking">
    <b-button v-b-modal.list_saved_data v-on:click="refresh_list"
      >Load</b-button
    >
    <b-modal id="list_saved_data" title="saved_data" @ok="loadData">
      <b-table
        striped
        hover
        :fields="saved_fields"
        :items="list_saved_data"
        show-empty
        selectable
        select-mode="single"
        @row-selected="onRowSelected"
      >
        <template #cell(actions)="row">
          <b-icon-trash v-on:click="remove_saved_data(row.index)"></b-icon-trash>
        </template>
      </b-table>
    </b-modal>
    <b-container>
      <div v-if="!edit_title">
        <span class="title">{{ title }}</span>
        <b-link v-on:click="switch_edit_title">edit</b-link>
      </div>
      <div v-else>
        <b-form-input
          v-model="title"
          type="text"
          placeholder="Enter Title"
          v-if="edit_title"
        ></b-form-input>
        <b-link v-on:click="switch_edit_title">save</b-link>
      </div>
      <b-button v-b-modal.key_settings>Key Settings</b-button>
      <b-modal id="key_settings" title="Key Settings" ok-only>
        <div>
          <b-form-input v-model="key"></b-form-input
          ><b-button v-on:click="add_key">Add</b-button>
          <b-table striped hover :fields="key_fields" :items="keys">
            <template #cell(actions)="row">
              <b-icon-arrow-up
                v-on:click="move_key(row.index, -1)"
              ></b-icon-arrow-up>
              <b-icon-arrow-down
                v-on:click="move_key(row.index, 1)"
              ></b-icon-arrow-down>
              <b-icon-trash v-on:click="remove_key(row.index)"></b-icon-trash>
            </template>
          </b-table>
        </div>
      </b-modal>
      <b-button v-b-modal.target_settings>Target Settings</b-button>
      <b-modal id="target_settings" title="Target Settings" ok-only>
        <div>
          <b-form-input v-model="target"></b-form-input>
          <b-button v-on:click="add_target">Add</b-button>
          <b-table striped hover :fields="target_fields" :items="targets">
            <template #cell(actions)="row">
              <b-icon-arrow-up
                v-on:click="move_target(row.index, -1)"
              ></b-icon-arrow-up>
              <b-icon-arrow-down
                v-on:click="move_target(row.index, 1)"
              ></b-icon-arrow-down>
              <b-icon-trash
                v-on:click="remove_target(row.index)"
              ></b-icon-trash>
            </template>
          </b-table>
        </div>
      </b-modal>
      <div v-if="ranking_body.length > 0">
        <b-table striped hover :fields="ranking_header" :items="ranking_body">
          <template
            v-for="field in ranking_header"
            v-slot:[slotname(field)]="data"
          >
            <div v-if="data.field.key == 'key'" :key="field">
              {{ data.item.key }}
            </div>
            <div v-else :key="field">
              <b-form-input
                v-model="contents[data.item.key][data.field.key].point"
                type="number"
                placeholder="point"
              ></b-form-input>
              <b-form-textarea
                v-model="contents[data.item.key][data.field.key].description"
                placeholder="備考"
              ></b-form-textarea>
            </div>
          </template>
        </b-table>
        <b-button v-on:click="save">Save</b-button>
        <b-button v-on:click="show_graph">Shwo graph</b-button>
        <div id="viz"></div>
      </div>
      <div v-else>
        No show Data
      </div>
    </b-container>
  </div>
</template>

<script>
import embed from "vega-embed";
import {spec as radar} from './scheam/radar';
import MyStorage from '../store/storage';
const storage = new MyStorage();
export default {
  name: "Ranking",
  data: function() {
    return {
      key_fields: ["key", "actions"],
      target_fields: ["target", "actions"],
      saved_fields: ["title", "actions"],
      title: "Test",
      edit_title: false,
      keys: [],
      key: "",
      targets: [],
      target: "",
      contents: {},
      list_saved_data: [],
      selected: []
    };
  },
  created: function() {

  },
  computed: {
    ranking_header: function() {
      const tmp = ["key"];
      this.targets.forEach(t => {
        tmp.push(t.target);
      });
      return tmp;
    },
    ranking_body: function() {
      const table_data = [];
      this.keys.forEach(key => {
        const keyIndex = key.key;
        const row = { key: keyIndex };

        this.targets.forEach(target => {
          if (!this.contents[keyIndex]) {
            this.contents[keyIndex] = {};
          }
          if (!this.contents[keyIndex][target.target]) {
            this.contents[keyIndex][target.target] = {};
          }
          row[target.target] = "";
        });
        table_data.push(row);
      });
      return table_data;
    }
  },
  methods: {
    switch_edit_title: function() {
      this.edit_title = !this.edit_title;
    },
    add_key: function() {
      this.keys.push({
        key: this.key
      });
      this.key = "";
    },
    move_key: function(index, diff) {
      this.keys = this._move(this.keys, index, diff);
      return;
    },
    remove_key: function(index) {
      const cloneArray = [...this.keys];
      const key = this.keys[index];
      cloneArray.splice(index, 1);
      this.keys = cloneArray;
      console.log(key);
      delete this.contents[key.key];
    },
    add_target: function() {
      this.targets.push({
        target: this.target
      });
      this.target = "";
    },

    _move: function(data, index, diff) {
      const targetId = index + diff;
      if(targetId < 0 || targetId >= data.length){
        return data;
      }
      const sourceId = index;
      const cloneArray  = [...data];
      [cloneArray[targetId], cloneArray[sourceId]] = [
        data[sourceId], data[targetId]
      ];
      return cloneArray;
    },
    move_target: function(index, diff) {
      this.targets = this._move(this.targets, index, diff);
      return;
    },
    remove_target: function(index) {
      const cloneArray = [...this.targets];
      const t = this.targets[index].target;
      Object.keys(this.contents).forEach(k => {
        const con = this.contents[k];
        delete con[t];
      });
      cloneArray.splice(index, 1);
      this.targets = cloneArray;
    },
    remove_saved_data: function(index) {
      const sd = this.list_saved_data[index];
      storage.delete(sd.uuid);
      this.refresh_list();
    },
    slotname: function(field) {
      return "cell(" + field + ")";
    },
    refresh_list: function() {
      const savedData = storage.uuids();
      this.list_saved_data = [];
      if (savedData) {
        Object.keys(savedData).forEach(k => {
          const datum = savedData[k];
          this.list_saved_data.push({
            uuid: k,
            title: datum
          });
        });
      }
    },
    onRowSelected: function(items) {
      this.selected = items;
    },
    load: function(savedData) {
      const tmp = JSON.parse(savedData);
      this.title = tmp.title;
      this.contents = tmp.contents;
      let loaded = false;
      Object.keys(this.contents).forEach(k => {
        this.keys.push({ key: k });
        if(!loaded){
          Object.keys(this.contents[k]).forEach(t => {
            this.targets.push({ target: t });
          });
          loaded = true;
        }
      });
    },
    loadData: function() {
      if (this.selected.length != 1) {
        alert("選択してください");
        return;
      }
      const data = storage.get(this.selected[0].uuid);
      this.uuid = this.selected[0].uuid;
      this.load(data);
    },
    save: function() {
      const saveData = {
        title: this.title,
        contents: this.contents
      };
      if (!this.uuid) {
        this.uuid = storage.create(saveData);
      }else {
        storage.save(this.uuid, saveData);
      }
      alert("保存しました");
    },
    show_graph: function() {
      const data = [];
      Object.keys(this.contents).forEach(k => {
        Object.keys(this.contents[k]).forEach(t => {
          const datum = {
            key: k,
            category: t,
            value: this.contents[k][t].point,
            description: this.contents[k][t].description
          };

          data.push(datum);
        });
      });
      this.draw(data);
    },
    async draw(data) {
      let def = radar(data)
      await embed("#viz", def, { actions: false });
    }
  }
};
</script>

<style scoped>
.title {
  padding-left: 10pt;
  padding-right: 10pt;
}
</style>
