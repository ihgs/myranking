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
            <b-icon-trash v-on:click="remove_target(row.index)"></b-icon-trash>
          </template>
        </b-table>
      </div>
      </b-modal>
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
        <div id="viz"></div>
      </div>
    </b-container>
  </div>
</template>

<script>
import embed from "vega-embed";
export default {
  name: "Ranking",
  data: function() {
    return {
      key_fields: ["key", "actions"],
      target_fields: ["target", "actions"],
      title: "Test",
      edit_title: false,
      keys: [{ key: "aaa" }, { key: "bbb" }, {key: "ccc"}],
      key: "",
      targets: [{ target: "AAAA" }, { target: "CCCC" }, { target: "DDDD" }],
      target: "",
      contents: {
        aaa: {
          AAAA: { point: "1", description: "a" },
          CCCC: { point: "2", description: "b" },
          DDDD: { point: "3", description: "c" }
        },
        bbb: {
          AAAA: { point: "4", description: "d" },
          CCCC: { point: "5", description: "e" },
          DDDD: { point: "6", description: "f" }
        },
        ccc: {
          AAAA: { point: "9", description: "g" },
          CCCC: { point: "8", description: "h" },
          DDDD: { point: "7", description: "i" }
        }
      }
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
      const key = this.keys[index]
      cloneArray.splice(index, 1);
      this.keys = cloneArray;
      console.log(key)
      delete this.contents[key.key]
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
      const t = this.targets[index].target;
      Object.keys(this.contents).forEach(k=>{
        const con = this.contents[k];
        delete con[t];
      })
      cloneArray.splice(index, 1);
      this.targets = cloneArray;
      
    },
    slotname: function(field) {
      return "cell(" + field + ")";
    },
    show_graph: function() {
      console.log(this.contents);
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
      console.log(data);
      let def = {
        $schema: "https://vega.github.io/schema/vega/v5.json",
        description:
          "A radar chart example, showing multiple dimensions in a radial layout.",
        width: 400,
        height: 400,
        padding: 40,
        autosize: { type: "none", contains: "padding" },

        signals: [{ name: "radius", update: "width / 2" }],

        data: [
          {
            name: "table",
            values: data
          },
          {
            name: "keys",
            source: "table",
            transform: [
              {
                type: "aggregate",
                groupby: ["key"]
              }
            ]
          }
        ],

        scales: [
          {
            name: "angular",
            type: "point",
            range: { signal: "[-PI, PI]" },
            padding: 0.5,
            domain: { data: "table", field: "key" }
          },
          {
            name: "radial",
            type: "linear",
            range: { signal: "[0, radius]" },
            zero: true,
            nice: false,
            domain: { data: "table", field: "value" },
            domainMin: 0
          },
          {
            name: "color",
            type: "ordinal",
            domain: { data: "table", field: "category" },
            range: { scheme: "category10" }
          }
        ],

        encode: {
          enter: {
            x: { signal: "radius" },
            y: { signal: "radius" }
          }
        },

        marks: [
          {
            type: "group",
            name: "categories",
            zindex: 1,
            from: {
              facet: { data: "table", name: "facet", groupby: ["category"] }
            },
            marks: [
              {
                type: "line",
                name: "category-line",
                from: { data: "facet" },
                encode: {
                  enter: {
                    interpolate: { value: "linear-closed" },
                    x: {
                      signal:
                        "scale('radial', datum.value) * cos(scale('angular', datum.key))"
                    },
                    y: {
                      signal:
                        "scale('radial', datum.value) * sin(scale('angular', datum.key))"
                    },
                    stroke: { scale: "color", field: "category" },
                    strokeWidth: { value: 1 },
                    fill: { scale: "color", field: "category" },
                    fillOpacity: { value: 0.1 }
                  }
                }
              },
              {
                type: "text",
                name: "value-text",
                from: { data: "category-line" },
                encode: {
                  enter: {
                    x: { signal: "datum.x" },
                    y: { signal: "datum.y" },
                    text: { signal: "datum.datum.value" },
                    align: { value: "center" },
                    baseline: { value: "middle" },
                    fill: { value: "black" },
                    tooltip: { signal: "datum.datum.description" }
                  }
                }
              }
            ]
          },
          {
            type: "rule",
            name: "radial-grid",
            from: { data: "keys" },
            zindex: 0,
            encode: {
              enter: {
                x: { value: 0 },
                y: { value: 0 },
                x2: { signal: "radius * cos(scale('angular', datum.key))" },
                y2: { signal: "radius * sin(scale('angular', datum.key))" },
                stroke: { value: "lightgray" },
                strokeWidth: { value: 1 }
              }
            }
          },
          {
            type: "text",
            name: "key-label",
            from: { data: "keys" },
            zindex: 1,
            encode: {
              enter: {
                x: {
                  signal: "(radius + 5) * cos(scale('angular', datum.key))"
                },
                y: {
                  signal: "(radius + 5) * sin(scale('angular', datum.key))"
                },
                text: { field: "key" },
                align: [
                  {
                    test: "abs(scale('angular', datum.key)) > PI / 2",
                    value: "right"
                  },
                  {
                    value: "left"
                  }
                ],
                baseline: [
                  {
                    test: "scale('angular', datum.key) > 0",
                    value: "top"
                  },
                  {
                    test: "scale('angular', datum.key) == 0",
                    value: "middle"
                  },
                  {
                    value: "bottom"
                  }
                ],
                fill: { value: "black" },
                fontWeight: { value: "bold" }
              }
            }
          },
          {
            type: "line",
            name: "outer-line",
            from: { data: "radial-grid" },
            encode: {
              enter: {
                interpolate: { value: "linear-closed" },
                x: { field: "x2" },
                y: { field: "y2" },
                stroke: { value: "lightgray" },
                strokeWidth: { value: 1 }
              }
            }
          }
        ]
      };
      await embed("#viz", def, { actions: false });
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
