import React, { useState, useCallback, Component, useEffect } from 'react';
import "rc-dock/dist/rc-dock.css"
import DockLayout, { LayoutData, TabBase, TabData, LayoutBase, PanelData, BoxData, BoxBase } from 'rc-dock';

// List Tab 
// List操作を模擬
interface ListTabProps {
  addItem: () => void;
}

const ListTab: React.FC<ListTabProps> = (props) => {
  return (
    <div>
      <p>
        tab操作
        <button onClick={props.addItem}>Tab追加</button>
      </p>
    </div>
  );
}

// FormTab
// 各編集フォームを模擬

interface FormTabProps {
  canClose?: boolean;
  value: string;
  updateTabTitle?: (title: string) => void;
}

interface IFormTab {
  canClose: () => boolean,
  getCount: () => number,
}

const FormTabBase: React.ForwardRefRenderFunction<IFormTab, FormTabProps> = (props, ref) => {
  const [count, setCount] = useState(0);
  useEffect(
    () => {
      console.log("FormTabBase", "mounted", props.value);
    },
    []
  );
  useEffect(
    () => {
      console.log("FormTabBase", "updated", props.value);
    }
  );
  
  console.log("FormTabBase", "render", props.value);
  useEffect(
    () => {
      return () => {

        if (ref) {
          if (typeof ref === "function") {
            ref(null);
          }
          else {
            ref.current = null
          }
        }
      }
    },
    [ref]
  );
  useEffect(
    () => {
      if (ref) {
        const refObj = {
          canClose: () => !!props.canClose,
          getCount: () => count,
        }
        if (typeof ref === "function") {
          ref(refObj);
        }
        else {
          ref.current = refObj
        }
      }
    },
    [count, props.canClose, ref]
  );
  const inclement = useCallback(
    () => {
      setCount(o => ++o)
    },
    []
  );
  const [tabTitle, setTabTitle] = useState("");
  const _setTabTitle = useCallback(
    (event: React.FormEvent<HTMLInputElement>) => {
      const el = event.currentTarget;
      if (el) {
        setTabTitle(el.value);
      }
    },
    []
  );

  const raizeSetTitle = useCallback(
    () => {
      if (props.updateTabTitle) {
        props.updateTabTitle(tabTitle);
      }
    },
    [props, tabTitle]
  );

  return (
    <div>
      <p>
        <span>Mock value = {props.value}</span>
      </p>
      <div>
        <div>
          <label>count</label>
        </div>
        <div>
          <input value={count} readOnly={true}></input>
        </div>
        <div>
          <button onClick={inclement}>++</button>
        </div>
      </div>
      <div>
        <div>
          <label>Tab Title</label>
        </div>
        <div>
          <input value={tabTitle} onChange={_setTabTitle}></input>
        </div>
        <div>
          <button onClick={raizeSetTitle}>++</button>
        </div>
      </div>
    </div>
  )
}

const FormTab = React.forwardRef(FormTabBase);

interface ILayoutProps {

}

interface ILayoutState {
  layout: LayoutData;
}

export class Layout extends Component<ILayoutProps, ILayoutState> {
  /**
   * DockLayoutの参照
   */
  dockRef: DockLayout | null = null;

  /**
   * 参照
   */
  formRefs: { [id: string]: IFormTab | null } = {};

  /**
   * 
   * @param id 
   * @param formRef 
   */
  addFormRef(id: string, formRef: IFormTab | null) {
    this.formRefs[id] = formRef;
  }

  /**
   * コンストラクタ
   * @param props 
   */
  constructor(props: ILayoutProps) {
    super(props);

    // propsやstateにアクセスするため、関数類を自分自身にbindする
    this.updateTitle = this.updateTitle.bind(this);
    this.addTab = this.addTab.bind(this);
    this.setLayoutRef = this.setLayoutRef.bind(this);
    this.onLayoutChange = this.onLayoutChange.bind(this);
    this.loadTab = this.loadTab.bind(this);

    this.state = {
      layout: {
        dockbox: {
          mode: 'horizontal',
          children: [
            {
              tabs: [
                {
                  id: 'tab1',
                  title: 'tab1',
                  cached: true, // Floating/tab 変更時にコンポーネントを使いまわす
                  closable: false,
                  content: <ListTab addItem={this.addTab}></ListTab>
                },
                {
                  id: 'KeepState',
                  title: 'keep state',
                  cached: true,
                  closable: true,
                  content:
                    <FormTab
                      ref={(el) =>
                        this.addFormRef("KeepState", el)}
                      updateTabTitle={(title) => {
                        this.updateTitle("KeepState", title);
                      }}
                      value={"keep state"}></FormTab>
                },
                {
                  id: 'ForgetState',
                  title: 'forget state',
                  cached: false,
                  closable: true,
                  content:
                    <FormTab
                      ref={(el) => this.addFormRef("ForgetState", el)}
                      value={"forget state"}
                      updateTabTitle={(title) => {
                        this.updateTitle("ForgetState", title);
                      }}
                    ></FormTab>
                },
              ],
            },
            {
              id: "mytab",
              tabs: [
                {
                  id: 'tab4',
                  title: 'Show confilm before close',
                  closable: true,
                  content:
                    <FormTab
                      ref={(el) => this.addFormRef("tab4", el)}
                      canClose={true}
                      updateTabTitle={(title) => {
                        this.updateTitle("tab4", title);
                      }}
                      value={"Tab 4 confilm before close"}></FormTab>
                },
                {
                  id: 'tab5',
                  title: 'Quiet close',
                  closable: true,
                  content:
                    <FormTab
                      ref={(el) => this.addFormRef("tab5", el)}
                      canClose={false}
                      updateTabTitle={(title) => {
                        this.updateTitle("tab5", title);
                      }}
                      value={"Tab 5 not confilm before close"}></FormTab>
                },
              ],
            },
          ],
        },
      },
    }
  }

  /**
   * タブのタイトルを変える
   */
  updateTitle(id: string, title: string) {
    if (this.dockRef) {
      const tab = this.dockRef.find(id) as TabData | undefined | null;
      if (tab) {
        console.log("updateTitle", `${tab.title} -> ${title}`)
        tab.title = title;
        this.dockRef.updateTab(id, { ...tab });
      }
    }
  }

  /**
   * DockLayoutのrefのsetter
   * @param dockRef 
   */
  setLayoutRef(dockRef: DockLayout) {
    this.dockRef = dockRef;
  }

  /**
   * style
   */
  style = {
    // ※Dock Layout自身がサイズを持たないと表示されない(つぶれてしまう)
    // position: "absolute",
    // top: "0",
    // bottom: "0",
    // left: "0",
    // right:"0",
    width: "1000px",
    height: "600px",
  }

  /**
   * render
   */
  render() {

    return (
      <DockLayout
        ref={this.setLayoutRef}
        layout={this.state.layout} // layou
        onLayoutChange={this.onLayoutChange}
        loadTab={this.loadTab}
        saveTab={this.saveTab}
        style={this.style} />
    );
  }

  /**
   * Tabのロード
   * @param tab 
   */
  loadTab(tab: TabBase) {
    return tab as TabData;
  }

  /**
   * タブ保存時の処理
   * ※ 指定しないとid以外の情報が消えてしまうため、引数をそのまま返すコールバックを追加する
   * @param tab 
   */
  saveTab(tab: TabBase) {
    return tab;
  }

  /**
   * レイアウト変更イベント
   * @param newLayout 新しいレイアウト
   * @param currentTabId カレントなTab
   */
  onLayoutChange(newLayout: LayoutBase, currentTabId: string) {
    console.log("onLayoutChange", currentTabId);

    // 削除（カレントタブidはnull）
    if (!currentTabId) {

      // 　∧∧∧∧∧∧∧∧
      // ＜　※キモいとこ　＞
      //　 ∨∨∨∨∨∨∨∨

      // newLayoutとstate.layoutの差分を取る
      // state.layoutにしかないタブが削除対象

      const toFlatTabs = (box: BoxBase | undefined) => {
        if (!box) {
          return [];
        }
        return box.children.reduce(
          (p, c, i, a) => {
            if ((c as BoxData).children) {
              p.push(...toFlatTabs(c as BoxData));
            }
            else if ((c as PanelData).tabs) {

              p.push(...(c as PanelData).tabs);
            }
            return p
          },
          [] as TabData[]
        );
      }
      const newTabs = [
        ...toFlatTabs(newLayout.dockbox),
        ...toFlatTabs(newLayout.floatbox),
        ...toFlatTabs(newLayout.maxbox),
      ]

      const currentTabs = [
        ...toFlatTabs(this.state.layout.dockbox),
        ...toFlatTabs(this.state.layout.floatbox),
        ...toFlatTabs(this.state.layout.maxbox),
      ]

      // stateにしか存在しないtab (=削除するやつ)を取り出す
      const closeTarget = currentTabs.filter(t => !newTabs.includes(t));
      if (closeTarget.length) {
        // Formのrefを取り出す
        const firstFoundId = closeTarget[0].id!;
        const firstFoundRef = this.formRefs[firstFoundId];
        if (firstFoundRef) {
          if (firstFoundRef.canClose()) {

            // 削除対象がない場合にrefからチェック
            if (!window.confirm(`閉じる？ tabId=[${firstFoundId}] content state=[${firstFoundRef.getCount()}]`)) {
              return;
            }
          }

          // 削除するformのref削除する
          delete this.formRefs[closeTarget[0].id!];
        }
      }
    }

    this.setState({ layout: newLayout as LayoutData });
  }

  /**
   * Tabの追加
   */
  addTab() {

    if (this.dockRef) {

      let mock = this.dockRef.find("mock");

      if (!mock) {
        console.log("new tab");
        mock = {
          id: "mock",
          title: "Added by list tab",
          closable: true,
          content:
            <FormTab
              ref={(el) => this.addFormRef("mock", el)}
              value={"Tab 6"}
              updateTabTitle={(title) => {
                this.updateTitle("mock", title);
              }}
            />
        };

        // 　∧∧∧∧∧∧∧∧
        // ＜　※キモいとこ　＞
        //　 ∨∨∨∨∨∨∨∨

        let mytab = this.dockRef.find("mytab");
        if (!mytab) {
          // 追加するパネルがないときは作成
          // dockMoveがうまく動かないのでstateで代用
          // キモイ箇所の2
          console.log("new pane;");
          mytab = {
            id: "mytab",
            tabs: [mock as TabData]
          };

          this.setState(
            {
              ...this.state,
              layout: {
                ...this.state.layout,
                dockbox: {
                  ...this.state.layout.dockbox,
                  children: [
                    ...this.state.layout.dockbox.children,
                    mytab
                  ]
                }
              },
            }
          );
        } else {
          
          // パネルにTab追加
          this.dockRef.dockMove(mock, mytab, "middle");
        }
      }
      //
      else {
        
        // パネルにTab表示
        //this.dockRef.dockMove(mock, mock.parent as PanelData, "middle");
      }
    }
  }
}

const App = () => {
  return <Layout />;
}
export default App;
