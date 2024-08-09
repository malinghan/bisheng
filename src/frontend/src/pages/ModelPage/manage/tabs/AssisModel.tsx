import { Button } from "@/components/bs-ui/button";
import { Input } from "@/components/bs-ui/input";
import { Label } from "@/components/bs-ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/bs-ui/select";
import { useToast } from "@/components/bs-ui/toast/use-toast";
import { QuestionTooltip } from "@/components/bs-ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getAssistantModelConfig, updateAssistantModelConfig } from "@/controllers/API/finetune";
import { captureAndAlertRequestErrorHoc } from "@/controllers/request";
import { PlusIcon } from "@radix-ui/react-icons";
import { Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";


const ModelRow = ({ item, index, llmOptions, updateField, deleteRow }) => (
    <div className="grid mb-4 items-center" style={{ gridTemplateColumns: "repeat(3, 1fr) 200px repeat(2, 1fr) 80px" }}>
        <div className="pr-2">
            <Select value={item.model_id} onValueChange={(val) => updateField(index, 'model_id', val)}>
                <SelectTrigger>
                    <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {llmOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id}>{option.model_name}</SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
        <div className="pr-2">
            <Select value={item.agent_executor_type} onValueChange={(val) => updateField(index, 'agent_executor_type', val)}>
                <SelectTrigger>
                    <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem value="function call">Function call</SelectItem>
                        <SelectItem value="ReAct">ReAct</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
        <div className="pr-2">
            <Select value={item.streaming ? "1" : "0"} onValueChange={(val) => updateField(index, 'streaming', val === "1")}>
                <SelectTrigger>
                    <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem value="1">是</SelectItem>
                        <SelectItem value="0">否</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
        <div className="pr-2">
            <Input type="number" value={item.knowledge_max_content} onChange={(e) => updateField(index, 'knowledge_max_content', parseInt(e.target.value))} max={15000} />
        </div>
        <div className="pr-2">
            <Select value={item.knowledge_sort_index ? "1" : "0"} onValueChange={(val) => updateField(index, 'knowledge_sort_index', val === "1")}>
                <SelectTrigger>
                    <SelectValue placeholder="" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem value="1">是</SelectItem>
                        <SelectItem value="0">否</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
        <div className="m-auto">
            <RadioGroup value={item.default ? "1" : "0"} onValueChange={(val) => updateField(index, 'default', val === "1")}>
                <RadioGroupItem value="1"></RadioGroupItem>
            </RadioGroup>
        </div>
        <div className="m-auto">
            <Trash2Icon className="text-gray-500 cursor-pointer size-4" onClick={() => deleteRow(index)} />
        </div>
    </div>
);

const defaultValue = {
    llm_list: [{
        model_id: null,
        agent_executor_type: "",
        knowledge_max_content: 0,
        knowledge_sort_index: false,
        default: true,
        streaming: false
    }],
    auto_llm: {
        model_id: null,
        agent_executor_type: "",
        knowledge_max_content: 0,
        knowledge_sort_index: false,
        default: false,
        streaming: false
    }
}

export default function AssisModel({ llmOptions, onBack }) {
    const [form, setForm] = useState({ ...defaultValue });
    const { t } = useTranslation('model')

    useEffect(() => {
        getAssistantModelConfig().then(({ llm_list, auto_llm }) => setForm({
            llm_list,
            auto_llm: auto_llm || { ...defaultValue.auto_llm }
        }))
    }, []);

    const updateField = (index, field, value) => {
        const updatedList = form.llm_list.map((item, i) => {
            if (i === index) {
                return { ...item, [field]: value };
            } else if (field === 'default' && value === true) {
                return { ...item, default: false };
            }
            return item;
        });

        setForm({ ...form, llm_list: updatedList });
    };

    const updateAutoLLMField = (field, value) => {
        setForm({ ...form, auto_llm: { ...form.auto_llm, [field]: value } });
    };

    const addNewRow = () => {
        const newRow = {
            model_id: null,
            agent_executor_type: "",
            knowledge_max_content: 0,
            knowledge_sort_index: false,
            default: false,
            streaming: false
        };
        setForm({
            ...form,
            llm_list: [...form.llm_list, newRow]
        });
    };

    const deleteRow = (index) => {
        const updatedList = form.llm_list.filter((_, i) => i !== index).map((item, i) => {
            if (i === 0) return { ...item, default: true };
            return item;
        });
        setForm({ ...form, llm_list: updatedList });
    };

    const { message } = useToast()
    const handleSave = () => {
        console.log('Form data to save:', form);
        captureAndAlertRequestErrorHoc(updateAssistantModelConfig(form).then(res => {
            message({ variant: 'success', description: t('model.saveSuccess') })
        }));
    };

    return (
        <div className="w-[70vw] mx-auto pt-2">
            <div className="mb-6">
                <span className="pl-1">{t('model.assistantInferenceModel')}</span>
                <div className="mt-2 border p-4 rounded-md bg-muted">
                    <div className="grid mb-4 items-center" style={{ gridTemplateColumns: "repeat(3, 1fr) 200px repeat(2, 1fr) 80px" }}>
                        <Label className="bisheng-label">{t('model.model')}</Label>
                        <Label className="bisheng-label">
                            <span>{t('model.assistantExecutionMode')}</span>
                            <QuestionTooltip className="relative top-0.5 ml-1" content={t('model.assistantExecutionModeTooltip')} />
                        </Label>
                        <Label className="bisheng-label">{t('model.streamingOutput')}</Label>
                        <Label className="bisheng-label">
                            <span>{t('model.assistantKnowledgeBaseMaxCharacters')}</span>
                            <QuestionTooltip className="relative top-0.5 ml-1" content={t('model.assistantKnowledgeBaseMaxCharactersTooltip')} />
                        </Label>
                        <Label className="bisheng-label">
                            <span>{t('model.reorderAfterRetrieval')}</span>
                            <QuestionTooltip className="relative top-0.5 ml-1" content={t('model.reorderAfterRetrievalTooltip')} />
                        </Label>
                        <Label className="bisheng-label text-center">{t('model.setAsDefault')}</Label>
                        <div></div>
                    </div>
                    {form.llm_list.map((item, index) => (
                        <ModelRow
                            key={index}
                            item={item}
                            index={index}
                            llmOptions={llmOptions}
                            updateField={updateField}
                            deleteRow={deleteRow}
                        />
                    ))}
                    <Button variant="outline" size="icon" onClick={addNewRow}>
                        <PlusIcon></PlusIcon>
                    </Button>
                </div>
            </div>
            <div className="">
                <span className="pl-1">{t('model.assistantAutoOptimizationModel')}</span>
                <div className="mt-2 border p-4 rounded-md bg-muted">
                    <div className="grid grid-cols-5 gap-2">
                        <Label className="bisheng-label">{t('model.model')}</Label>
                        <Label className="bisheng-label">{t('model.streamingOutput')}</Label>
                    </div>
                    <div className="grid grid-cols-5 gap-2 mt-4">
                        <Select value={form.auto_llm.model_id} onValueChange={(val) => updateAutoLLMField('model_id', val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {llmOptions.map((option) => (
                                        <SelectItem key={option.id} value={option.id}>{option.model_name}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        <Select value={form.auto_llm.streaming ? "1" : "0"} onValueChange={(val) => updateAutoLLMField('streaming', val === "1")}>
                            <SelectTrigger>
                                <SelectValue placeholder="" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectItem value="1">{t('model.yes')}</SelectItem>
                                    <SelectItem value="0">{t('model.no')}</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
            <div className="mt-10 text-center space-x-6">
                <Button className="px-6" variant="outline" onClick={onBack}>{t('model.cancel')}</Button>
                <Button className="px-10" onClick={handleSave}>{t('model.save')}</Button>
            </div>
        </div>
    );
}
