import styles from "./sidebarTags.module.scss";
import { useValue } from "../../../../hooks/useValue";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../../../store/origineStore";
import { useEffect, useRef } from "react";
import { cloneDeep } from "lodash";
import { ITextField, TextField } from "@fluentui/react";

interface IGameConfig {
  gameName: string;
  titleBgm: string;
  titleBackground: string;
}

export default function GameConfig() {
  const state = useSelector((state: RootState) => state.status.editor);

  // 拿到游戏配置
  const gameConfig = useValue<IGameConfig>({ gameName: "", titleBgm: "", titleBackground: "" });
  const getGameConfig = () => {
    axios
      .get(`/api/manageGame/getGameConfig/${state.currentEditingGame}`)
      .then((r) => parseAndSetGameConfigState(r.data));
  };

  function parseAndSetGameConfigState(data: string) {
    // 开始解析
    // 先拆行，拆行之前把\r 换成 \n
    let newData = data.replace(/\r/g, "\n");
    const dataArray: string[] = newData.split("\n");
    // 对于每一行，，截取分号，找出键值
    let dataWithKeyValue = dataArray.map((e: string) => {
      let commandText = e.replaceAll(/[;；]/g, "");
      return commandText.split(":");
    });
    dataWithKeyValue = dataWithKeyValue.filter((e) => e.length >= 2);
    // 开始修改
    dataWithKeyValue.forEach((e) => {
      switch (e[0]) {
      case "Game_name":
        gameConfig.set({ ...gameConfig.value, gameName: e[1] });
        break;
      case "Title_bgm":
        gameConfig.set({ ...gameConfig.value, titleBgm: e[1] });
        break;
      case "Title_img":
        gameConfig.set({ ...gameConfig.value, titleBackground: e[1] });
        break;
      default:
        console.log("NOT PARSED");
      }
    });
  }

  useEffect(() => {
    getGameConfig();
  }, []);

  function updateGameConfig(key: keyof IGameConfig, content: string) {
    const draft = cloneDeep(gameConfig.value);
    draft[key] = content;
    gameConfig.set(draft);
    const newConfig = `Game_name:${gameConfig.value.gameName};\nTitle_bgm:${gameConfig.value.titleBgm};\nTitle_img:${gameConfig.value.titleBackground};\n`;
    const form = new URLSearchParams();
    form.append('gameName',state.currentEditingGame);
    form.append('newConfig',newConfig);
    axios.post(`/api/manageGame/setGameConfig/`,form).then(getGameConfig);
  }


  return (
    <div>
      <div className={styles.sidebar_tag_title}>游戏配置</div>
      <div>
        <div className={styles.sidebar_gameconfig_container}>
          <div className={styles.sidebar_gameconfig_title}>游戏名称</div>
          <GameConfigEditor key="gameName" value={gameConfig.value.gameName} onChange={(e:string)=>updateGameConfig("gameName", e)}/>
        </div>
        <div className={styles.sidebar_gameconfig_container}>
          <div className={styles.sidebar_gameconfig_title}>标题背景图片</div>
          <GameConfigEditor key="titleBackground" value={gameConfig.value.titleBackground} onChange={(e:string)=>updateGameConfig("titleBackground", e)}/>
        </div>
        <div className={styles.sidebar_gameconfig_container}>
          <div className={styles.sidebar_gameconfig_title}>标题背景音乐</div>
          <GameConfigEditor key="titleBgm" value={gameConfig.value.titleBgm} onChange={(e:string)=>updateGameConfig("titleBgm", e)}/>
        </div>
      </div>
    </div>
  );
}

interface IGameConfigEditor {
  key: keyof IGameConfig;
  value: string;
  onChange: Function;
}

function GameConfigEditor(props: IGameConfigEditor) {
  const showEditBox = useValue(false);
  const inputBoxRef = useRef<ITextField>(null);
  return <div>
    {!showEditBox.value && props.value}
    {!showEditBox.value && <div className={styles.editButton} onClick={()=>{showEditBox.set(true);
      setTimeout(()=>inputBoxRef.current?.focus(),100);
    }}>修改</div>}
    {showEditBox.value && <TextField componentRef={inputBoxRef} defaultValue={props.value}
      onBlur={()=>{props.onChange(inputBoxRef!.current!.value);showEditBox.set(false);}}
    />}
  </div>;
}