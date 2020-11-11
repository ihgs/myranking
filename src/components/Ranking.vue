<template>
  <div class="ranking">
    <b-container>
      <div v-if="!edit_title">
        <div>{{ title }}</div>
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
            <b-icon-trash v-on:click="remove_target(row.index)"></b-icon-trash>
          </template>
        </b-table>
      </div>
      <div>
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
              <b-form-input
                v-model="contents[data.item.key][data.field.key].description"
                placeholder="備考"
              ></b-form-input>
            </div>
          </template>
        </b-table>
        <b-button v-on:click="show_graph">Shwo graph</b-button>
      </div>
    </b-container>
  </div>
</template>

<script>
export default {
  name: "Ranking",
  data: function() {
    return {
      key_fields: ["key", "actions"],
      target_fields: ["target", "actions"],
      title: "Test",
      edit_title: false,
      keys: [{ key: "aaa" }, { key: "bbb" }],
      key: "",
      targets: [{ target: "AAAA" }, { target: "CCCC" }, { target: "DDDD" }],
      target: "",
      contents: {}
    };
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
      const targetId = index + diff;
      if (targetId < 0 || targetId >= this.keys.length) {
        return;
      }
      const sourceId = index;
      const cloneArray = [...this.keys];
      [cloneArray[targetId], cloneArray[sourceId]] = [
        this.keys[sourceId],
        this.keys[targetId]
      ];
      this.keys = cloneArray;
      return;
    },
    remove_key: function(index) {
      const cloneArray = [...this.keys];
      cloneArray.splice(index, 1);
      this.keys = cloneArray;
    },
    add_target: function() {
      this.targets.push({
        target: this.target
      });
      this.target = "";
    },
    move_target: function(index, diff) {
      const targetId = index + diff;
      if (targetId < 0 || targetId >= this.targets.length) {
        return;
      }
      const sourceId = index;
      const cloneArray = [...this.targets];
      [cloneArray[targetId], cloneArray[sourceId]] = [
        this.targets[sourceId],
        this.targets[targetId]
      ];
      this.targets = cloneArray;
      return;
    },
    remove_target: function(index) {
      const cloneArray = [...this.targets];
      cloneArray.splice(index, 1);
      this.targets = cloneArray;
    },
    slotname: function(field) {
      return "cell(" + field + ")";
    },
    show_graph: function() {
      console.log(this.contents);
    }
  },
  watch: {
    contents: {
      handler: function(val, oldVal) {
        console.log(val + "+" + oldVal);
      },
      deep: true
    }
  }
};
</script>
