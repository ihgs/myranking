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
        <b-table striped hover :fields="fields" :items="keys">
          <template #cell(actions)="row">
            <b-icon-arrow-up v-on:click="move_key(row.index, -1)"></b-icon-arrow-up>
            <b-icon-arrow-down
              v-on:click="move_key(row.index, 1)"
            ></b-icon-arrow-down>
            <b-icon-trash v-on:click="remove_key(row.index)"></b-icon-trash>
          </template>
        </b-table>
      </div>
    </b-container>
  </div>
</template>

<script>
export default {
  name: "Ranking",
  data: function() {
    return {
      fields: ["key", "actions"],
      title: "Test",
      edit_title: false,
      keys: [{ key: "aaa" }, { key: "bbb" }],
      key: ""
    };
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
    }
  }
};
</script>
