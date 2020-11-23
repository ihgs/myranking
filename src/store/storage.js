import { v4 as uuidv4 } from "uuid";

export default class MyStorage {

  constructor () {

  }

  create(data){
    const uuid = uuidv4();
    this.save(uuid, data)
    return uuid;
  }

  save(uuid, data){
    localStorage.setItem(
      "myranking:data:" + uuid,
      JSON.stringify(data)
    );
    let uuids = this.uuids();
    uuids[uuid] = data.title;
    localStorage.setItem("myranking:uuids", JSON.stringify(uuids));
    return;
  }
  uuids(){
    let uuids = JSON.parse(localStorage.getItem("myranking:uuids"));
    if (!uuids) {
      uuids = {};
    }
    return uuids;
  }

  get(uuid){
    return localStorage.getItem("myranking:data:" + uuid);;
  }

  delete(uuid){
    let uuids = JSON.parse(localStorage.getItem("myranking:uuids"));
    delete uuids[uuid];
    localStorage.setItem("myranking:uuids", JSON.stringify(uuids));
  }
}