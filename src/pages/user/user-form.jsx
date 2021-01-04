import React, {PureComponent} from 'react'
import PropTypes from 'prop-types'
import {
  Form,
  Select,
  Input,
  message
} from 'antd'
import {reqToGetAcctId,reqCheckPhone} from '../../api/index'

const Item = Form.Item
const Option = Select.Option

/*
添加/修改用户的form组件
 */
class UserForm extends PureComponent {

  static propTypes = {
    setForm: PropTypes.func.isRequired, // 用来传递form对象的函数
    roles: PropTypes.array.isRequired,
    user: PropTypes.object,
  }

  state = {
    accountNameState:'',
    phoneState:'',
    usernameState:'',
    mailState: '',
    prsnIdNumState:''
  }

  getAcctId = () => {
    this.props.form.validateFields( async (error,values) => {
      if(!error){
        const{accountName} = values
        const result = await reqToGetAcctId(accountName)
        if(result.status === '0'){
          const username1 = result.data
          this.props.form.setFieldsValue({
            'username':username1
          })
          this.setState({usernameState:'success'})
        }else{
          message.error(result.msg)
          this.setState({usernameState:'error'})
        }
      }
    })
  }

  checkPhone = () => {
    this.props.form.validateFields( async (error,values) => {
      if(!error){
        const{telPhone} = values
        const result = await reqCheckPhone(telPhone)
        if(null != telPhone && '' != telPhone){
          if(result.status != '0'){
            message.error(result.msg)
            this.setState({phoneState:'error'})
          }else{
            this.setState({phoneState:'success'})
          }
        }else{
          this.setState({mailState:''})
        }
      }
    })
  }

  onBlurs = () => {
    this.props.form.validateFields( async (error,values) => {
      if(!error){
        const{accountName,mail,prsnIdNum} = values
        if(null != accountName && '' != accountName){
          this.setState({accountNameState:'success'})
        }else{
          this.setState({accountNameState:''})
        }
        if(null != mail && '' != mail){
          this.setState({mailState:'success'})
        }else{
          this.setState({mailState:''})
        }
        if(null != prsnIdNum && '' != prsnIdNum){
          this.setState({prsnIdNumState:'success'})
        }else{
          this.setState({prsnIdNumState:''})
        }
      }
    })
  }

  UNSAFE_componentWillMount () {
    this.props.setForm(this.props.form)
  }

  render() {

    const {roles, user} = this.props
    const { getFieldDecorator } = this.props.form
    const {accountNameState,usernameState,phoneState,mailState,prsnIdNumState} = this.state
    // 指定Item布局的配置对象
    const formItemLayout = {
      labelCol: { span: 4 },  // 左侧label的宽度
      wrapperCol: { span: 15 }, // 右侧包裹的宽度
    }

    return (
      <Form {...formItemLayout}>
        <Item label='姓名'
          hasFeedback
          validateStatus={accountNameState}
        >
          {
            getFieldDecorator('accountName', {
              initialValue: user.accountName,
            })(
              <Input placeholder='请输入用户名'
                onBlur={this.onBlurs}
              />
            )
          }
        </Item>

        <Item label='主账号'
          hasFeedback
          validateStatus={usernameState}
        >
          {
            getFieldDecorator('username', {
              initialValue: user.username,
            })(
              <Input placeholder='系统生成主账号'
                type="text"
                autoComplete="off"
                readOnly={true}
                onFocus={this.getAcctId}
             />
            )
          }
        </Item>

        <Item label='手机号'
          hasFeedback
          validateStatus={phoneState}>
          {
            getFieldDecorator('telPhone', {
              initialValue: user.telPhone,
            })(
              <Input placeholder='请输入手机号'
                onBlur = {this.checkPhone}
              />
            )
          }
        </Item>
        <Item label='邮箱'
          hasFeedback
          validateStatus={mailState}
        >
          {
            getFieldDecorator('mail', {
              initialValue: user.mail,
            })(
              <Input placeholder='请输入邮箱'
                onBlur={this.onBlurs}
              />
            )
          }
        </Item>
        <Item label='身份证号'
          hasFeedback
          validateStatus={prsnIdNumState}
        >
          {
            getFieldDecorator('prsnIdNum', {
              initialValue: user.prsnIdNum,
            })(
              <Input placeholder='请输入身份证号'
                onBlur={this.onBlurs}
              />
            )
          }
        </Item>

        {/* <Item label='角色'>
          {
            getFieldDecorator('roleid', {
              initialValue: user.roleid,
            })(
              <Select>
                {
                  roles.map(role => <Option key={role.id} value={role.id}>{role.name}</Option>)
                }
              </Select>
            )
          }
        </Item> */}
      </Form>
    )
  }
}

export default Form.create()(UserForm)