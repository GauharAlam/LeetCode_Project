import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useParams, useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Navbar from '../components/Navbar';
import axiosClient from '../utils/axiosClient';
import { Trash2, PlusCircle, Save, ArrowLeft, Loader2 } from 'lucide-react';

// Validation Schema matches Backend Model
const ProblemSchema = z.object({
  title: z.string().min(3, "Title too short"),
  description: z.string().min(10, "Description too short"),
  difficulty: z.enum(["easy", "medium", "hard"]),
  tags: z.string().transform(val => val.split(',').map(t => t.trim()).filter(Boolean)),
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
  const { id } = useParams(); // If ID exists, we are in EDIT mode
  const navigate = useNavigate();
  const isEditMode = !!id;

  const { register, control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(ProblemSchema),
    defaultValues: {
      difficulty: 'easy',
      tags: '', // handled as string in UI
      visibleTestCases: [{ input: '', output: '', explanation: '' }],
      hiddenTestCases: [{ input: '', output: '', explanation: '' }],
      startCode: DEFAULT_LANGUAGES.map(lang => ({ language: lang, initialCode: '' })),
      referenceSolution: DEFAULT_LANGUAGES.map(lang => ({ language: lang, completeCode: '' }))
    }
  });

  const { fields: visibleFields, append: appendVisible, remove: removeVisible } = useFieldArray({ control, name: "visibleTestCases" });
  const { fields: hiddenFields, append: appendHidden, remove: removeHidden } = useFieldArray({ control, name: "hiddenTestCases" });
  
  // Note: We won't use FieldArray for code/reference for now to keep UI simple, 
  // assume fixed 3 languages or handled via controlled inputs mapped to DEFAULT_LANGUAGES

  useEffect(() => {
    if (isEditMode) {
      axiosClient.get(`/problem/problemById/${id}`)
        .then(({ data }) => {
          // Flatten tags array to string for input
          reset({
            ...data,
            tags: data.tags.join(', ')
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
    <div className="min-h-screen bg-gray-950 text-gray-200 pb-20">
      <Navbar />
      <div className="max-w-5xl mx-auto py-10 px-4">
        
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/admin')} className="btn btn-circle btn-ghost">
            <ArrowLeft />
          </button>
          <h1 className="text-3xl font-bold text-white">
            {isEditMode ? 'Edit Problem' : 'Create New Problem'}
          </h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Section 1: Basic Info */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-md space-y-4">
            <h2 className="text-xl font-semibold text-blue-400">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label text-gray-400">Title</label>
                <input {...register("title")} className="input input-bordered bg-gray-800" placeholder="e.g. Two Sum" />
                {errors.title && <span className="text-red-400 text-sm">{errors.title.message}</span>}
              </div>

              <div className="form-control">
                <label className="label text-gray-400">Difficulty</label>
                <select {...register("difficulty")} className="select select-bordered bg-gray-800">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="form-control">
              <label className="label text-gray-400">Tags (comma separated)</label>
              <input {...register("tags")} className="input input-bordered bg-gray-800" placeholder="Array, Hash Table" />
            </div>

            <div className="form-control">
              <label className="label text-gray-400">Description (Markdown)</label>
              <textarea {...register("description")} className="textarea textarea-bordered bg-gray-800 h-32" placeholder="Problem description..." />
              {errors.description && <span className="text-red-400 text-sm">{errors.description.message}</span>}
            </div>
          </div>

          {/* Section 2: Test Cases */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TestCaseSection title="Visible Test Cases" fields={visibleFields} append={appendVisible} remove={removeVisible} register={register} name="visibleTestCases" />
            <TestCaseSection title="Hidden Test Cases" fields={hiddenFields} append={appendHidden} remove={removeHidden} register={register} name="hiddenTestCases" />
          </div>

          {/* Section 3: Code Logic */}
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-md">
            <h2 className="text-xl font-semibold text-green-400 mb-4">Solution & Boilerplate</h2>
            <div className="space-y-6">
              {DEFAULT_LANGUAGES.map((lang, index) => (
                <div key={lang} className="collapse collapse-arrow border border-gray-700 bg-gray-800/50">
                  <input type="checkbox" /> 
                  <div className="collapse-title text-lg font-medium capitalize flex items-center gap-2">
                    <CodeIcon lang={lang} /> {lang} Configuration
                  </div>
                  <div className="collapse-content space-y-4 pt-2">
                    {/* Hidden input to ensure language field is sent */}
                    <input type="hidden" value={lang} {...register(`startCode.${index}.language`)} />
                    <input type="hidden" value={lang} {...register(`referenceSolution.${index}.language`)} />

                    <div className="form-control">
                      <label className="label text-xs uppercase tracking-wide text-gray-500">Starter Code (User sees this)</label>
                      <textarea 
                        {...register(`startCode.${index}.initialCode`)} 
                        className="textarea textarea-bordered font-mono text-sm h-24 bg-gray-950" 
                        placeholder={`class Solution {\n  // your code here \n}`}
                      />
                    </div>
                    <div className="form-control">
                      <label className="label text-xs uppercase tracking-wide text-gray-500">Reference Solution (Used for validation)</label>
                      <textarea 
                        {...register(`referenceSolution.${index}.completeCode`)} 
                        className="textarea textarea-bordered font-mono text-sm h-32 bg-gray-950 border-green-900/50" 
                         placeholder={`// Complete working solution`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="btn btn-primary btn-lg w-full md:w-auto gap-2"
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
  <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 shadow-md h-full flex flex-col">
    <div className="flex justify-between items-center mb-4">
      <h3 className="font-semibold text-gray-300">{title}</h3>
      <button type="button" onClick={() => append({ input: '', output: '', explanation: '' })} className="btn btn-xs btn-outline btn-success gap-1">
        <PlusCircle size={14} /> Add Case
      </button>
    </div>
    <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
      {fields.map((field, index) => (
        <div key={field.id} className="p-3 bg-gray-800 rounded-lg relative group border border-gray-700">
          <button type="button" onClick={() => remove(index)} className="btn btn-xs btn-circle btn-error absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Trash2 size={12} />
          </button>
          <div className="grid grid-cols-1 gap-2">
            <input {...register(`${name}.${index}.input`)} placeholder="Input (e.g. nums=[2,7], target=9)" className="input input-sm input-bordered bg-gray-900" />
            <input {...register(`${name}.${index}.output`)} placeholder="Output (e.g. [0,1])" className="input input-sm input-bordered bg-gray-900" />
            <input {...register(`${name}.${index}.explanation`)} placeholder="Explanation (Optional)" className="input input-sm input-bordered bg-gray-900" />
          </div>
        </div>
      ))}
      {fields.length === 0 && <p className="text-gray-600 text-sm text-center italic py-4">No test cases added.</p>}
    </div>
  </div>
);

const CodeIcon = ({ lang }) => {
  if (lang.includes('script')) return <span className="text-yellow-400">JS</span>;
  if (lang.includes('java')) return <span className="text-red-400">☕</span>;
  return <span className="text-blue-400">C++</span>;
};

export default ProblemForm;