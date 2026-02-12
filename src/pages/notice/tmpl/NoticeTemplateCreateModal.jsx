import {Modal, Form, Input, Button, Card, Tooltip, Checkbox, Drawer, Radio, Space, Select} from 'antd'
import VSCodeEditor from "../../../utils/VSCodeEditor";
import React, { useEffect, useState } from 'react'
import { createNoticeTmpl, updateNoticeTmpl } from '../../../api/noticeTmpl'
import FeiShuImg from "../img/feishu.svg";
import EmailImg from "../img/Email.svg";
import DingDingImg from "../img/dingding.svg";
import WeChatImg from "../img/qywechat.svg"
import SlackImg from "../img/slack.svg"
import {QuestionCircleOutlined, PlusOutlined, MinusCircleOutlined} from "@ant-design/icons";

const MyFormItemContext = React.createContext([])

function toArr(str) {
    return Array.isArray(str) ? str : [str]
}

// 表单
const MyFormItem = ({ name, ...props }) => {
    const prefixPath = React.useContext(MyFormItemContext)
    const concatName = name !== undefined ? [...prefixPath, ...toArr(name)] : undefined
    return <Form.Item name={concatName} {...props} />
}

// 函数组件
const NoticeTemplateCreateModal = ({ visible, onClose, selectedRow, type, handleList }) => {
    const [form] = Form.useForm()
    const [selectedNotifyCard, setSelectedNotifyCard] = useState(null);
    const [notifyType,setNotifyType] = useState('')
    const [isChecked, setIsChecked] = useState(false)

    // 禁止输入空格
    const [spaceValue, setSpaceValue] = useState('')

    const handleInputChange = (e) => {
        // 移除输入值中的空格
        const newValue = e.target.value.replace(/\s/g, '')
        setSpaceValue(newValue)
    }

    const handleKeyPress = (e) => {
        // 阻止空格键的默认行为
        if (e.key === ' ') {
            e.preventDefault()
        }
    }

    useEffect(() => {
        if (selectedRow) {
            form.setFieldsValue({
                id: selectedRow.id,
                name: selectedRow.name,
                description: selectedRow.description,
                noticeType: selectedRow.noticeType,
                template: selectedRow.template,
                templateFiring: selectedRow.templateFiring,
                templateRecover: selectedRow.templateRecover,
                enableFeiShuJsonCard: selectedRow.enableFeiShuJsonCard,
            })

            let t = 0;
            if (selectedRow.noticeType === "FeiShu"){
                t = 0
            } else if (selectedRow.noticeType === "Email"){
                t = 1
            } else if (selectedRow.noticeType === "DingDing"){
                t = 2
            } else if (selectedRow.noticeType === "WeChat"){
                t = 3
            } else if (selectedRow.noticeType === "Slack"){
                t = 4
            }else if (selectedRow.noticeType === "HTTP"){ // 增加HTTP
                t = 5
            }

            setIsChecked(selectedRow.enableFeiShuJsonCard)
            setNotifyType(selectedRow.noticeType)
            setSelectedNotifyCard(t)
            console.log(t)
        }
    }, [selectedRow, form])

const handleCreate = async (values) => {
        try {
            let finalValues = { ...values };
            // 如果是 HTTP 类型，将分散的字段打包成 JSON 字符串存入 template
            if (notifyType === 'HTTP') {
                const httpPayload = {
                    headers: values.httpHeaders,
                    method: values.httpMethod,
                    bodyType: values.httpBodyType,
                    params: values.httpParams,
                    body: values.httpBodyContent
                };
                finalValues.template = JSON.stringify(httpPayload);
            }
            const params = {
                ...finalValues,
                noticeType: notifyType,
                enableFeiShuJsonCard: isChecked,
            }
            await createNoticeTmpl(params)
            handleList()
        } catch (error) {
            console.error(error)
        }
    }

    const handleUpdate = async (values) => {
        try {
            let finalValues = { ...values };
            // 同上，更新时也打包
            if (notifyType === 'HTTP') {
                const httpPayload = {
                    headers: values.httpHeaders,
                    method: values.httpMethod,
                    bodyType: values.httpBodyType,
                    params: values.httpParams,
                    body: values.httpBodyContent
                };
                finalValues.template = JSON.stringify(httpPayload);
            }
            const newValue = {
                ...finalValues,
                id: selectedRow.id,
                noticeType: notifyType,
                enableFeiShuJsonCard: isChecked,
            }
            await updateNoticeTmpl(newValue)
            handleList()
        } catch (error) {
            console.error(error)
        }
    }

    // 提交
    const handleFormSubmit = (values) => {
        if (type === 'create') {
            handleCreate(values)

        }
        if (type === 'update') {
            handleUpdate(values)
        }

        // 关闭弹窗
        onClose()
    }

    const cards = [
        {
            imgSrc: FeiShuImg,
            text: '飞书',
        },
        {
            imgSrc: EmailImg,
            text: '邮件',
        },
        {
            imgSrc: DingDingImg,
            text: '钉钉',
        },
        {
            imgSrc: WeChatImg,
            text: '企业微信'
        },
        {
            imgSrc: SlackImg,
            text: 'Slack'
        },
        {
            imgSrc: EmailImg, // 使用邮件图标
            text: 'HTTP'
        }
    ];

    useEffect(() => {
        if (selectedNotifyCard === null){
            setSelectedNotifyCard(0)
            setNotifyType("FeiShu")
        }
    }, [])

    const handleCardClick = (index) => {
        let t = "FeiShu";
       if (index === 1){
            t = "Email"
        } else if (index === 2){
            t = "DingDing"
        } else if (index === 3){
           t = "WeChat"
        } else if (index === 4){
           t = "Slack"
        } else if (index === 5){ // 新增HTTP
           t = "HTTP"
        }

        setNotifyType(t)
        setSelectedNotifyCard(index);
    };

    const handleSubmit = async () => {
        const values = form.getFieldsValue();
        await form.validateFields()
        await handleFormSubmit(values)
    }

    return (
        <Drawer
            title="创建通知模版"
            open={visible}
            onClose={onClose}
            size='large'
            footer={
            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                <Button
                    type="primary"
                    htmlType="submit"
                    onClick={handleSubmit}
                    style={{
                        backgroundColor: '#000',
                    }}
                >
                    提交
                </Button>
            </div>}
        >
            <Form form={form} name="form_item_path" layout="vertical">
                <div style={{display: 'flex'}}>
                    <MyFormItem name="name" label="名称"
                                style={{
                                    marginRight: '10px',
                                    width: '500px',
                                }}
                                rules={[
                                    {
                                        required: true,
                                    },
                                ]}>
                        <Input
                            value={spaceValue}
                            onChange={handleInputChange}
                            onKeyPress={handleKeyPress}
                            disabled={type === 'update'}/>
                    </MyFormItem>

                    <MyFormItem name="description" label="描述"
                                style={{
                                    marginRight: '10px',
                                    width: '500px',
                                }}>
                        <Input/>
                    </MyFormItem>
                </div>

                <div style={{display: 'flex'}}>
                    <MyFormItem name="" label="模版类型">
                        <div style={{display: 'flex', gap: '10px'}}>
                            {cards.map((card, index) => (
                                <Card
                                    key={index}
                                    style={{//调整图标大小
                                        height: 100,
                                        width: 100,
                                        position: 'relative',
                                        cursor: type === 'update' ? 'not-allowed' : 'pointer',
                                        border: selectedNotifyCard === index ? '2px solid #1890ff' : '1px solid #d9d9d9',
                                        pointerEvents: type === 'update' ? 'none' : 'auto',
                                    }}
                                    onClick={() => handleCardClick(index)}
                                >
                                    <div style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: '100%',
                                        marginTop: '-10px'
                                    }}>
                                        <img src={card.imgSrc}
                                             style={{height: '50px', width: '100px', objectFit: 'contain'}}
                                             alt={card.text}/>
                                        <p style={{
                                            fontSize: '12px',
                                            textAlign: 'center',
                                            marginTop: '5px'
                                        }}>{card.text}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </MyFormItem>
                </div>

                {selectedNotifyCard === 0 && (
                    <div style={{display: 'flex', alignItems: 'center'}}>
                        <MyFormItem style={{marginBottom: '0', marginRight: '10px'}}>
                            <span>应用飞书高级消息卡片</span>
                            <Tooltip title="需要则输入 飞书消息卡片搭建工具的Json Code">
                                <QuestionCircleOutlined style={{color: '#1890ff', marginLeft: '4px'}}/>
                            </Tooltip>
                        </MyFormItem>
                        <Checkbox
                            style={{marginTop: '0', marginRight: '10px'}}
                            checked={isChecked}
                            onChange={(e) => setIsChecked(e.target.checked)}
                        />
                    </div>
                )}

                {(!isChecked || (notifyType !== "FeiShu" && notifyType !== "HTTP")) && (
                    <div>
                        <MyFormItem
                            name="template"
                            label="告警模版"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}>
                            <VSCodeEditor height={"500px"}/>
                        </MyFormItem>
                    </div>
                ) || (
                    <div>
                        <MyFormItem
                            name="templateFiring"
                            label="告警模版"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}>
                            <VSCodeEditor height={"350px"}/>
                        </MyFormItem>
                        <MyFormItem
                            name="templateRecover"
                            label="恢复模版"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}>
                            <VSCodeEditor height={"350px"}/>
                        </MyFormItem>
                    </div>
                )}
                {/* 新增 HTTP 模板配置区域 */}
                {notifyType === "HTTP" && (
                    <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 20 }}>
                        {/* 第一行：Header */}
                        <div style={{ marginBottom: 10, fontWeight: 'bold' }}>Headers</div>
                        <Form.List name="httpHeaders">
                            {(fields, { add, remove }) => (
                                <>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'key']}
                                                rules={[{ required: true, message: 'Key必填' }]}
                                            >
                                                <Input placeholder="Header Key" />
                                            </Form.Item>
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'value']}
                                                rules={[{ required: true, message: 'Value必填' }]}
                                            >
                                                <Input placeholder="Header Value" />
                                            </Form.Item>
                                            <MinusCircleOutlined onClick={() => remove(name)} />
                                        </Space>
                                    ))}
                                    <Form.Item>
                                        <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                            添加 Header
                                        </Button>
                                    </Form.Item>
                                </>
                            )}
                        </Form.List>

                        {/* 第二行：POST/GET 选项 */}
                        <MyFormItem name="httpMethod" label="请求方法" initialValue="GET">
                            <Radio.Group>
                                <Radio value="GET">GET</Radio>
                                <Radio value="POST">POST</Radio>
                            </Radio.Group>
                        </MyFormItem>

                        {/* 第三行：根据 Method 显示 */}
                        <Form.Item noStyle shouldUpdate={(prev, curr) => prev.httpMethod !== curr.httpMethod || prev.httpBodyType !== curr.httpBodyType}>
                            {({ getFieldValue }) => {
                                const method = getFieldValue('httpMethod') || 'GET';
                                const bodyType = getFieldValue('httpBodyType') || 'form';

                                return (
                                    <>
                                        {method === 'POST' && (
                                            <MyFormItem name="httpBodyType" label="Body 类型" initialValue="form">
                                                <Radio.Group>
                                                    <Radio value="form">Form Data</Radio>
                                                    <Radio value="json">JSON</Radio>
                                                    <Radio value="xml">XML</Radio>
                                                </Radio.Group>
                                            </MyFormItem>
                                        )}

                                        {/* GET 请求 或 POST+Form 显示键值对输入 */}
                                        {(method === 'GET' || (method === 'POST' && bodyType === 'form')) && (
                                            <>
                                                <div style={{ marginBottom: 10, fontWeight: 'bold' }}>Params</div>
                                                <Form.List name="httpParams">
                                                    {(fields, { add, remove }) => (
                                                        <>
                                                            {fields.map(({ key, name, ...restField }) => (
                                                                <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                                                    <Form.Item
                                                                        {...restField}
                                                                        name={[name, 'key']}
                                                                        rules={[{ required: true, message: 'Key必填' }]}
                                                                    >
                                                                        <Input placeholder="Param Key" />
                                                                    </Form.Item>
                                                                    <Form.Item
                                                                        {...restField}
                                                                        name={[name, 'value']}
                                                                        rules={[{ required: true, message: 'Value必填' }]}
                                                                    >
                                                                        <Input placeholder="Param Value" />
                                                                    </Form.Item>
                                                                    <MinusCircleOutlined onClick={() => remove(name)} />
                                                                </Space>
                                                            ))}
                                                            <Form.Item>
                                                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                                                    添加参数
                                                                </Button>
                                                            </Form.Item>
                                                        </>
                                                    )}
                                                </Form.List>
                                            </>
                                        )}

                                        {/* POST + JSON/XML 显示代码编辑器 */}
                                        {method === 'POST' && (bodyType === 'json' || bodyType === 'xml') && (
                                            <MyFormItem
                                                name="httpBodyContent"
                                                label="Body 内容"
                                                rules={[{ required: true, message: 'Body内容必填' }]}
                                            >
                                                <VSCodeEditor height={"300px"} language={bodyType} />
                                            </MyFormItem>
                                        )}
                                    </>
                                )
                            }}
                        </Form.Item>
                    </div>
                )}
            </Form>
        </Drawer>
    )
}

export default NoticeTemplateCreateModal
