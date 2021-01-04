import React, {Component} from 'react'
import {
  Card,
  Button,
  Table,
  Modal,
  message
} from 'antd'
import {PAGE_SIZE} from "../../utils/constants"
import {reqRoles, reqAddRole, reqUpdateRole} from '../../api'
import AddForm from './add-form'
import AuthForm from './auth-form'
import memoryUtils from "../../utils/memoryUtils"
import {formateDate} from '../../utils/dateUtils'
import storageUtils from "../../utils/storageUtils";

/*
角色路由
 */
export default class Role extends Component {

  state = {
    roles: [], // 所有角色的列表
    role: {}, // 选中的role
    isShowAdd: false, // 是否显示添加界面
    isShowAuth: false, // 是否显示设置权限界面
  }

  constructor (props) {
    super(props)

    this.auth = React.createRef()
  }

  initColumn = () => {
    this.columns = [
      {
        title: '角色ID',
        dataIndex: 'roleId'
      },
      {
        title: '创建名称',
        dataIndex: 'roleName'
      },
      {
        title: '上级角色ID',
        dataIndex: 'superRoleId'
      },
      {
        title: '角色描述',
        dataIndex: 'description'
      },
    ]
  }

  getRoles = async () => {
    const result = await reqRoles()
    if (result.status==='0') {
      const roles = result.data
      this.setState({
        roles : roles
      })
    }
  }


  onRow = (role) => {
    return {
      onClick: event => { // 点击行
        console.log('row onClick()', role)
        // alert('点击行')
        this.setState({
          role
        })
      },
    }
  }

  /*
  添加角色
   */
  addRole = () => {
    // 进行表单验证, 只能通过了才向下处理
    this.form.validateFields(async (error, values) => {
      if (!error) {

        // 隐藏确认框
        this.setState({
          isShowAdd: false
        })

        // 收集输入数据
        const {roleName} = values
        this.form.resetFields()

        // 请求添加
        const result = await reqAddRole(roleName)
        // 根据结果提示/更新列表显示
        if (result.status===0) {
          message.success('添加角色成功')
          // this.getRoles()
          // 新产生的角色
          const role = result.data
          // 更新roles状态
          /*const roles = this.state.roles
          roles.push(role)
          this.setState({
            roles
          })*/

          // 更新roles状态: 基于原本状态数据更新
          this.setState(state => ({
            roles: [...state.roles, role]
          }))

        } else {
          message.success('添加角色失败')
        }

      }
    })


  }

  /*
  更新角色
   */
  updateRole = async () => {

    // 隐藏确认框
    this.setState({
      isShowAuth: false
    })

    const role = this.state.role
    // 得到最新的menus
    const menus = this.auth.current.getMenus()
    role.menus = menus
    role.auth_time = Date.now()
    role.auth_name = memoryUtils.user.username

    // 请求更新
    const result = await reqUpdateRole(role)
    if (result.status===0) {
      // this.getRoles()
      // 如果当前更新的是自己角色的权限, 强制退出
      if (role.id === memoryUtils.user.roleid) {
        memoryUtils.user = {}
        storageUtils.removeUser()
        this.props.history.replace('/login')
        message.success('当前用户角色权限成功')
      } else {
        message.success('设置角色权限成功')
        this.setState({
          roles: [...this.state.roles]
        })
      }

    }
  }

  UNSAFE_componentWillMount () {
    this.initColumn()
  }

  componentDidMount () {
    this.getRoles()
  }

  render() {

    const {roles, role, isShowAdd, isShowAuth} = this.state

    const title = (
      <span>
        <Button type='primary' onClick={() => this.setState({isShowAdd: true})}>创建角色</Button> &nbsp;&nbsp;
        <Button type='primary' disabled={!role.id} onClick={() => this.setState({isShowAuth: true})}>设置角色权限</Button>
      </span>
    )

    return (
      <Card title={title}>
        <Table
          bordered
          rowKey='id'
          dataSource={roles}
          columns={this.columns}
          pagination={{defaultPageSize: PAGE_SIZE}}
          rowSelection={{
            type: 'radio',
            selectedRowKeys: [role.id],
            onSelect: (role) => { // 选择某个radio时回调
              this.setState({
                role
              })
            }

          }}
          onRow={this.onRow}
        />

        <Modal
          title="添加角色"
          visible={isShowAdd}
          onOk={this.addRole}
          onCancel={() => {
            this.setState({isShowAdd: false})
            this.form.resetFields()
          }}
        >
          <AddForm
            setForm={(form) => this.form = form}
          />
        </Modal>

        <Modal
          title="设置角色权限"
          visible={isShowAuth}
          onOk={this.updateRole}
          onCancel={() => {
            this.setState({isShowAuth: false})
          }}
        >
          <AuthForm ref={this.auth} role={role}/>
        </Modal>
      </Card>
    )
  }
}