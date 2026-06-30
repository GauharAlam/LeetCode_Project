import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Navbar from '../components/Navbar';
import axiosClient from '../utils/axiosClient';
import { Trash2, PlusCircle, Save, ArrowLeft, Loader2 } from 'lucide-react';

const ProblemSchema = z.object({
  title: z.string().min(3, "Title too short"),
  description: z.string().min(10, "Description too short"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  tags: z.string().transform(val => val.split(',').map(t => t.trim()).filter(Boolean)),
  companies: z.string().transform(val => val.split(',').map(t => t.trim()).filter(Boolean)),
  constraints: z.string().optional(),
  hints: z.array(z.string()).optional(),
  visibleTestCases: z.array(z.object({
    input: z.string(),
    output: z.string(),
    explanation: z.string().optional()
  })).min(1, "At least one visible test case required"),
  hiddenTestCases: z.array(z.object({
    input: z.string(),
    output: z.string(),
    explanation: z.string().optional()
  })).min(1, "At least one hidden test case required"),
  startCode: z.array(z.object({
    language: z.string(),
    initialCode: z.string()
  })),
  referenceSolution: z.array(z.object({
    language: z.string(),
    completeCode: z.string()
  }))
});

const DEFAULT_LANGUAGES = ['c++', 'java', 'javascript'];

const ProblemForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(ProblemSchema),
    defaultValues: {
      difficulty: 'easy',
      tags: '',
      companies: '',
      constraints: '',
      hints: [''],
      visibleTestCases: [{ input: '', output: '', explanation: '' }],
      hiddenTestCases: [{ input: '', output: '', explanation: '' }],
      startCode: DEFAULT_LANGUAGES.map(lang => ({ language: lang, initialCode: '' })),
      referenceSolution: DEFAULT_LANGUAGES.map(lang => ({ language: lang, completeCode: '' }))
    }
  });

  const { fields: visibleFields, append: appendVisible, remove: removeVisible } = useFieldArray({ control, name: "visibleTestCases" });
  const { fields: hiddenFields, append: appendHidden, remove: removeHidden } = useFieldArray({ control, name: "hiddenTestCases" });
  const { fields: hintFields, append: appendHint, remove: removeHint } = useFieldArray({ control, name: "hints" });

  useEffect(() => {
    if (isEditMode) {
      axiosClient.get(`/problem/problemById/${id}`)
        .then(({ data }) => {
          reset({
            ...data,
            tags: data.tags.join(', '),
            companies: (data.companies || []).join(', '),
            hints: data.hints || ['']
          });
        })
        .catch(err => console.error(err));
    }
  }, [id, reset, isEditMode]);

  const onSubmit = async (data) => {
    try {
      if (isEditMode) {
        await axiosClient.put(`/problem/update/${id}`, data);
        alert("Problem Updated!");
      } else {
        await axiosClient.post('/problem/create', data);
        alert("Problem Created!");
      }
      navigate('/admin');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to save problem. Check reference solution code.");
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-text-primary pb-20">
      <Navbar />
      <div className="max-w-5xl mx-auto py-10 px-4">
        
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/admin')} className="btn-ghost-af p-2 rounded-lg transition-colors">
            <ArrowLeft />
          </button>
          <h1 className="text-3xl font-bold text-text-primary font-display">
            {isEditMode ? 'Edit Problem' : 'Create New Problem'}
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Section 1: Basic Info */}
          <div className="card-af space-y-4">
            <h2 className="text-xl font-bold text-text-primary font-display">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="micro-label block mb-1.5">Title</label>
                <input {...register("title")} className="input-af text-sm" placeholder="e.g. Two Sum" />
                {errors.title && <span className="text-hard text-xs mt-1 block font-mono">{errors.title.message}</span>}
              </div>

              <div>
                <label className="micro-label block mb-1.5">Difficulty</label>
                <select {...register("difficulty")} className="input-af text-sm cursor-pointer bg-surface">
                  <option value="easy" className="bg-surface">Easy</option>
                  <option value="medium" className="bg-surface">Medium</option>
                  <option value="hard" className="bg-surface">Hard</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="micro-label block mb-1.5">Tags (comma separated)</label>
                <input {...register("tags")} className="input-af text-sm" placeholder="Array, Hash Table" />
              </div>
              <div>
                <label className="micro-label block mb-1.5">Companies (comma separated)</label>
                <input {...register("companies")} className="input-af text-sm" placeholder="Google, Meta, Amazon" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div>
                 <label className="micro-label block mb-1.5">Constraints</label>
                 <textarea {...register("constraints")} className="input-af text-sm h-32 resize-none" placeholder="e.g. 1 <= nums.length <= 10^4" />
               </div>

               <div className="flex flex-col gap-2">
                 <div className="flex justify-between items-center mb-1">
                   <label className="micro-label">Hints</label>
                   <button type="button" onClick={() => appendHint('')} className="btn-ghost-af px-2 py-1 text-xs text-easy flex items-center gap-1">
                     <PlusCircle size={14} /> Add Hint
                   </button>
                 </div>
                 <div className="space-y-2 overflow-y-auto max-h-32 pr-2">
                   {hintFields.map((field, index) => (
                     <div key={field.id} className="flex gap-2">
                        <input {...register(`hints.${index}`)} className="input-af text-sm flex-1" placeholder={`Hint ${index + 1}`} />
                        <button type="button" onClick={() => removeHint(index)} className="btn-ghost-af text-hard p-2">
                          <Trash2 size={16} />
                        </button>
                     </div>
                   ))}
                 </div>
               </div>
            </div>

            <div>
              <label className="micro-label block mb-1.5">Description (Markdown)</label>
              <textarea {...register("description")} className="input-af text-sm h-32 resize-none" placeholder="Problem description..." />
              {errors.description && <span className="text-hard text-xs mt-1 block font-mono">{errors.description.message}</span>}
            </div>
          </div>

          {/* Section 2: Test Cases */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TestCaseSection title="Visible Test Cases" fields={visibleFields} append={appendVisible} remove={removeVisible} register={register} name="visibleTestCases" />
            <TestCaseSection title="Hidden Test Cases" fields={hiddenFields} append={appendHidden} remove={removeHidden} register={register} name="hiddenTestCases" />
          </div>

          {/* Section 3: Code Logic */}
          <div className="card-af">
            <h2 className="text-xl font-bold text-text-primary mb-4 font-display">Solution & Boilerplate</h2>
            <div className="space-y-4">
              {DEFAULT_LANGUAGES.map((lang, index) => (
                <details key={lang} className="group border border-border-subtle bg-inset rounded-card overflow-hidden">
                  <summary className="px-4 py-3 text-sm font-semibold capitalize flex items-center justify-between cursor-pointer hover:bg-elevated/40 select-none">
                    <span className="flex items-center gap-2"><CodeIcon lang={lang} /> {lang} Configuration</span>
                    <span className="transition-transform group-open:rotate-180"><ChevronDown size={16} className="text-text-muted" /></span>
                  </summary>
                  <div className="p-4 border-t border-border-subtle/50 space-y-4">
                    <input type="hidden" value={lang} {...register(`startCode.${index}.language`)} />
                    <input type="hidden" value={lang} {...register(`referenceSolution.${index}.language`)} />

                    <div>
                      <label className="micro-label block mb-1.5">Starter Code (User sees this)</label>
                      <textarea 
                        {...register(`startCode.${index}.initialCode`)} 
                        className="input-af text-sm font-mono h-24 bg-surface" 
                        placeholder={`class Solution {\n  // your code here \n}`}
                      />
                    </div>
                    <div>
                      <label className="micro-label block mb-1.5">Reference Solution (Used for validation)</label>
                      <textarea 
                        {...register(`referenceSolution.${index}.completeCode`)} 
                        className="input-af text-sm font-mono h-32 bg-surface" 
                         placeholder={`// Complete working solution`}
                      />
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn-ember w-full md:w-auto px-8 py-3 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
              {isSubmitting ? 'Validating & Saving...' : isEditMode ? 'Update Problem' : 'Create Problem'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

// Helper Components
const TestCaseSection = ({ title, fields, append, remove, register, name }) => (
  <div className="card-af h-full flex flex-col justify-between">
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-text-primary font-display">{title}</h3>
        <button type="button" onClick={() => append({ input: '', output: '', explanation: '' })} className="btn-secondary-af px-3 py-1 text-xs flex items-center gap-1">
          <PlusCircle size={14} className="text-text-muted" /> Add Case
        </button>
      </div>
      <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
        {fields.map((field, index) => (
          <div key={field.id} className="p-3 bg-inset rounded-lg relative group border border-border-subtle">
            <button type="button" onClick={() => remove(index)} className="btn-ghost-af text-hard absolute top-2 right-2 p-1">
              <Trash2 size={15} />
            </button>
            <div className="grid grid-cols-1 gap-2 pr-6">
              <input {...register(`${name}.${index}.input`)} placeholder="Input (e.g. nums=[2,7], target=9)" className="input-af text-xs" />
              <input {...register(`${name}.${index}.output`)} placeholder="Output (e.g. [0,1])" className="input-af text-xs" />
              <input {...register(`${name}.${index}.explanation`)} placeholder="Explanation (Optional)" className="input-af text-xs" />
            </div>
          </div>
        ))}
        {fields.length === 0 && <p className="text-text-muted text-sm text-center italic py-4">No test cases added.</p>}
      </div>
    </div>
  </div>
);

const CodeIcon = ({ lang }) => {
  if (lang.includes('script')) return <span className="text-text-muted font-mono text-xs">JS</span>;
  if (lang.includes('java')) return <span className="text-text-muted font-mono text-xs">JAVA</span>;
  return <span className="text-text-muted font-mono text-xs">C++</span>;
};

const ChevronDown = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className} style={{ width: size, height: size }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

export default ProblemForm;