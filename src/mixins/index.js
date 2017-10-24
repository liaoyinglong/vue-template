import Command from '@/common/js/command';

// 获取操作类型下拉框
export const getOperationList = {
  data() {
    return {
      operationList: [],
    };
  },
  methods: {
    // 操作类型(10、数据类、20、菜单类、21、按钮类、22、列表类)
    getOperationList(type = 10) {
      let that = this;
      let cmd = new Command();
      cmd.action = 'sys.system.data.getOperationList';
      cmd.operation_type = type;
      cmd.success = function(res) {
        that.operationList = res.data;
      };
      cmd.executeAsync();
    },
  },
  created() {
    this.getOperationList();
  },
};
// 获取账号列表数据
export const getUserSelector = {
  data() {
    return {
      userSelector: [],
    };
  },
  methods: {
    getUserSelector(org_id) {
      let that = this;
      let cmd = new Command();
      cmd.action = 'user.user.userSelector';
      cmd.org_id = org_id;
      cmd.is_contain_sub = 1;
      cmd.is_tree = 0;
      cmd.success = function(res) {
        that.userSelector = res.data;
      };
      cmd.executeAsync();
    },
  },
};
// 默认树节点选中
export const defaultTreeSelect = {
  methods: {
    /**
    * 默认树节点选中，需要绑定node-key
    * @param {any} key 绑定的node-key的值
    * @param {string} [treeRef="tree"] 树形节点需绑定ref 默认值是 tree
    */
    defaultTreeSelect(key, treeRef = 'tree') {
      let needKey = key;
      this.$refs[treeRef].$children.map(findTreeKey);
      /**
       * 辅助函数 递归展开父节点
       * @param {any} item VueComponent
       */
      function expandedParent(item) {
        if (item.$parent && item.$parent.expanded === false) {
          item.$parent.expanded = true;
          expandedParent(item.$parent);
        }
      }
      /**
       * 辅助函数 递归查找对应key的节点
       * @param {any} item VueComponent
       */
      function findTreeKey(item) {
        if (item.$vnode.key == needKey) {
          item.handleClick();
          expandedParent(item);
          return;
        }
        item.$children.map(val => {
          if (val.$vnode.key == needKey) {
            val.handleClick();
            expandedParent(val);
          } else if (val.$children.length !== 1 && val.$children.length !== 0) {
            findTreeKey(val);
          }
        });
      }
    },
  },
};
// 获取上级菜单列表 树形
export const getSystemMenuDrop = {
  data() {
    return {
      systemMenuDrop: [],
    };
  },
  methods: {
    getSystemMenuDrop(system_id) {
      let that = this;
      let cmd = new Command();
      cmd.action = 'sys.system.function.getSystemMenuDrop';
      cmd.system_id = system_id;
      cmd.success = function(res) {
        that.systemMenuDrop = res.data;
      };
      cmd.executeAsync();
    },
  },
};
