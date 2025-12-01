import{b as z,r as d,a as o,j as i,z as m}from"./index-341ba9ec.js";import{E as O}from"./jspdf.es.min-427a8c34.js";const F=()=>{const g=z(),[a,k]=d.useState(null),[p,y]=d.useState(""),[c,b]=d.useState("all"),[l,I]=d.useState(null);d.useEffect(()=>{const e=localStorage.getItem("resumeDraft");if(e)try{const r=JSON.parse(e);I(r.data||r)}catch(r){console.error("Error loading resume data:",r)}},[]);const u={all:"All Templates",professional:"Professional",modern:"Modern",creative:"Creative",minimal:"Minimal",executive:"Executive",academic:"Academic"},h=[{id:1,name:"Professional Classic",category:"professional",description:"Clean, traditional layout perfect for corporate roles",color:"#3b82f6",icon:"💼",popularity:95,tags:["corporate","business","traditional"]},{id:2,name:"Modern Tech",category:"modern",description:"Sleek design optimized for tech professionals",color:"#10b981",icon:"💻",popularity:88,tags:["technology","developer","startup"]},{id:3,name:"Creative Portfolio",category:"creative",description:"Bold and artistic for creative professionals",color:"#8b5cf6",icon:"🎨",popularity:76,tags:["design","art","portfolio"]},{id:4,name:"Minimal Elegance",category:"minimal",description:"Simple, clean and highly readable",color:"#6b7280",icon:"⚪",popularity:82,tags:["clean","simple","readable"]},{id:5,name:"Executive Suite",category:"executive",description:"Premium layout for senior leadership roles",color:"#f59e0b",icon:"👔",popularity:91,tags:["executive","management","leadership"]},{id:6,name:"Academic Scholar",category:"academic",description:"Structured format for academic and research positions",color:"#ef4444",icon:"🎓",popularity:79,tags:["academic","research","education"]},{id:7,name:"Startup Innovator",category:"modern",description:"Dynamic layout for startup environments",color:"#06b6d4",icon:"🚀",popularity:85,tags:["startup","innovation","dynamic"]},{id:8,name:"Corporate Executive",category:"professional",description:"Formal design for corporate executives",color:"#6366f1",icon:"🏢",popularity:89,tags:["corporate","executive","formal"]},{id:9,name:"Design Visionary",category:"creative",description:"Visually striking for design professionals",color:"#ec4899",icon:"✨",popularity:81,tags:["design","creative","visual"]},{id:10,name:"Tech Innovator",category:"modern",description:"Modern layout for technology roles",color:"#84cc16",icon:"🔧",popularity:87,tags:["tech","developer","engineer"]},{id:11,name:"Simple Professional",category:"minimal",description:"Straightforward and professional",color:"#64748b",icon:"📄",popularity:83,tags:["simple","professional","clean"]},{id:12,name:"Research Academic",category:"academic",description:"Comprehensive format for research positions",color:"#dc2626",icon:"🔬",popularity:77,tags:["research","academic","scientific"]},{id:13,name:"Leadership Pro",category:"executive",description:"Commanding presence for leaders",color:"#d97706",icon:"⭐",popularity:92,tags:["leadership","management","executive"]},{id:14,name:"Creative Artist",category:"creative",description:"Expressive layout for artists and creators",color:"#a855f7",icon:"🎭",popularity:74,tags:["artist","creative","portfolio"]},{id:15,name:"Modern Minimalist",category:"minimal",description:"Contemporary minimal design",color:"#475569",icon:"⬜",popularity:80,tags:["modern","minimal","contemporary"]},{id:16,name:"Business Professional",category:"professional",description:"Standard business format",color:"#1d4ed8",icon:"📊",popularity:90,tags:["business","professional","corporate"]},{id:17,name:"Tech Executive",category:"executive",description:"Executive format for tech leaders",color:"#059669",icon:"💎",popularity:86,tags:["tech","executive","leadership"]},{id:18,name:"Academic Professional",category:"academic",description:"Professional academic format",color:"#b91c1c",icon:"📚",popularity:78,tags:["academic","professional","education"]},{id:19,name:"Creative Professional",category:"creative",description:"Professional yet creative design",color:"#c026d3",icon:"🎯",popularity:84,tags:["creative","professional","design"]},{id:20,name:"Ultra Minimal",category:"minimal",description:"Extremely clean and space-efficient",color:"#374151",icon:"⚫",popularity:75,tags:["minimal","clean","compact"]}],x=h.filter(e=>{const r=e.name.toLowerCase().includes(p.toLowerCase())||e.description.toLowerCase().includes(p.toLowerCase())||e.tags.some(f=>f.toLowerCase().includes(p.toLowerCase())),n=c==="all"||e.category===c;return r&&n}),E=e=>{k(e),m.success(`Selected ${e.name} template`)},M=()=>{if(!a){m.error("Please select a template first");return}localStorage.setItem("selectedTemplate",JSON.stringify(a)),g("/builder",{state:{template:a}})},v=e=>{const r=window.open("","_blank");r.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Preview - ${e.name}</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 40px; 
                        background: #f5f5f5;
                    }
                    .preview-container {
                        max-width: 800px;
                        margin: 0 auto;
                        background: white;
                        padding: 40px;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                        border-radius: 8px;
                    }
                    .template-header {
                        text-align: center;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 2px solid ${e.color};
                    }
                    .template-name {
                        color: ${e.color};
                        font-size: 24px;
                        margin: 0;
                    }
                    .template-description {
                        color: #666;
                        font-size: 14px;
                    }
                    .preview-content {
                        display: grid;
                        grid-template-columns: 1fr 2fr;
                        gap: 30px;
                    }
                    .preview-section {
                        margin-bottom: 20px;
                    }
                    .preview-label {
                        font-weight: bold;
                        color: ${e.color};
                        margin-bottom: 5px;
                    }
                </style>
            </head>
            <body>
                <div class="preview-container">
                    <div class="template-header">
                        <h1 class="template-name">${e.name}</h1>
                        <p class="template-description">${e.description}</p>
                    </div>
                    <div class="preview-content">
                        <div>
                            <div class="preview-section">
                                <div class="preview-label">Contact Info</div>
                                <div>Email: your.email@example.com</div>
                                <div>Phone: +1 (555) 123-4567</div>
                            </div>
                            <div class="preview-section">
                                <div class="preview-label">Skills</div>
                                <div>• Leadership</div>
                                <div>• Project Management</div>
                                <div>• Strategic Planning</div>
                            </div>
                        </div>
                        <div>
                            <div class="preview-section">
                                <div class="preview-label">Experience</div>
                                <div><strong>Senior Manager</strong> - ABC Company (2020-Present)</div>
                                <div>Led team of 15 professionals...</div>
                            </div>
                            <div class="preview-section">
                                <div class="preview-label">Education</div>
                                <div><strong>MBA</strong> - University Name (2018)</div>
                            </div>
                        </div>
                    </div>
                    <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
                        This is a preview of the "${e.name}" template
                    </div>
                </div>
            </body>
            </html>
        `),r.document.close()},w=e=>{var C,S,T;if(!l){m.error("No resume data found. Please create a resume first."),g("/builder");return}const r=new O;r.setFillColor(parseInt(e.color.slice(1,3),16),parseInt(e.color.slice(3,5),16),parseInt(e.color.slice(5,7),16)),r.rect(0,0,210,40,"F"),r.setTextColor(255,255,255),r.setFontSize(20),r.text(`${((C=l.personalInfo)==null?void 0:C.firstName)||""} ${((S=l.personalInfo)==null?void 0:S.lastName)||""}`,20,25),r.setTextColor(0,0,0),r.setFontSize(12),r.text(((T=l.personalInfo)==null?void 0:T.jobTitle)||"Professional",20,45);let n=60;if(l.professionalSummary){r.setFontSize(14),r.setTextColor(parseInt(e.color.slice(1,3),16),parseInt(e.color.slice(3,5),16),parseInt(e.color.slice(5,7),16)),r.text("PROFESSIONAL SUMMARY",20,n),r.setTextColor(0,0,0),r.setFontSize(10);const P=r.splitTextToSize(l.professionalSummary,170);r.text(P,20,n+10),n+=10+P.length*5+15}const f=`resume-${e.name.toLowerCase().replace(/\s+/g,"-")}.pdf`;r.save(f),m.success(`Exported with ${e.name} template!`)},j=e=>h.filter(r=>e==="all"||r.category===e).length,t={container:{minHeight:"100vh",background:"linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",fontFamily:"'Inter', -apple-system, BlinkMacSystemFont, sans-serif"},header:{background:"white",borderBottom:"1px solid #e2e8f0",padding:"2rem 0",boxShadow:"0 1px 3px rgba(0, 0, 0, 0.1)"},headerContent:{maxWidth:"1200px",margin:"0 auto",padding:"0 2rem",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"1rem"},headerText:{flex:1},headerTitle:{fontSize:"2.5rem",fontWeight:"800",background:"linear-gradient(135deg, #3b82f6, #8b5cf6)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",margin:"0 0 0.5rem 0"},headerSubtitle:{fontSize:"1.1rem",color:"#64748b",margin:0,maxWidth:"500px"},headerActions:{display:"flex",gap:"1rem"},btnPrimary:{background:"linear-gradient(135deg, #3b82f6, #6366f1)",color:"white",border:"none",padding:"0.75rem 1.5rem",borderRadius:"0.5rem",fontWeight:"600",cursor:"pointer",transition:"all 0.2s ease",textDecoration:"none",display:"inline-flex",alignItems:"center",gap:"0.5rem"},btnSecondary:{background:"#f1f5f9",color:"#475569",border:"1px solid #e2e8f0",padding:"0.75rem 1.5rem",borderRadius:"0.5rem",fontWeight:"600",cursor:"pointer",transition:"all 0.2s ease"},btnOutline:{background:"transparent",color:"#3b82f6",border:"2px solid #3b82f6",padding:"0.75rem 1.5rem",borderRadius:"0.5rem",fontWeight:"600",cursor:"pointer",transition:"all 0.2s ease"},filtersSection:{maxWidth:"1200px",margin:"2rem auto",padding:"0 2rem",display:"flex",flexDirection:"column",gap:"1.5rem"},searchBox:{position:"relative",maxWidth:"400px"},searchInput:{width:"100%",padding:"1rem 1rem 1rem 3rem",border:"2px solid #e2e8f0",borderRadius:"0.75rem",fontSize:"1rem",transition:"all 0.2s ease",background:"white"},searchIcon:{position:"absolute",left:"1rem",top:"50%",transform:"translateY(-50%)",color:"#94a3b8"},categoryFilters:{display:"flex",flexWrap:"wrap",gap:"0.5rem"},categoryFilter:{background:"white",border:"2px solid #e2e8f0",padding:"0.5rem 1rem",borderRadius:"2rem",fontSize:"0.875rem",fontWeight:"500",cursor:"pointer",transition:"all 0.2s ease"},categoryFilterActive:{background:"#3b82f6",color:"white",borderColor:"#3b82f6"},selectedBanner:{background:"white",border:"2px solid #3b82f6",borderRadius:"1rem",margin:"2rem auto",maxWidth:"1200px",padding:"1.5rem",boxShadow:"0 4px 6px rgba(59, 130, 246, 0.1)"},bannerContent:{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:"1rem"},bannerInfo:{display:"flex",alignItems:"center",gap:"1rem"},bannerIcon:{fontSize:"2rem"},bannerTitle:{margin:"0 0 0.25rem 0",color:"#1e293b"},bannerDescription:{margin:0,color:"#64748b"},bannerActions:{display:"flex",gap:"0.75rem",flexWrap:"wrap"},templatesGrid:{maxWidth:"1200px",margin:"0 auto",padding:"2rem",display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(350px, 1fr))",gap:"2rem"},templateCard:{background:"white",borderRadius:"1rem",overflow:"hidden",boxShadow:"0 4px 6px rgba(0, 0, 0, 0.05)",transition:"all 0.3s ease",cursor:"pointer",border:"2px solid transparent"},templateCardSelected:{borderColor:"#3b82f6",boxShadow:"0 8px 20px rgba(59, 130, 246, 0.2)"},templateHeader:{padding:"1.5rem",color:"white",display:"flex",justifyContent:"space-between",alignItems:"flex-start",position:"relative"},templateIcon:{fontSize:"2rem"},templateBadge:{background:"rgba(255, 255, 255, 0.2)",padding:"0.25rem 0.75rem",borderRadius:"1rem",fontSize:"0.75rem",fontWeight:"600",backdropFilter:"blur(10px)"},templateContent:{padding:"1.5rem"},templateName:{fontSize:"1.25rem",fontWeight:"700",color:"#1e293b",margin:"0 0 0.5rem 0"},templateDescription:{color:"#64748b",fontSize:"0.875rem",lineHeight:"1.5",margin:"0 0 1rem 0"},templateTags:{display:"flex",flexWrap:"wrap",gap:"0.5rem",marginBottom:"1rem"},tag:{background:"#f1f5f9",color:"#475569",padding:"0.25rem 0.5rem",borderRadius:"0.375rem",fontSize:"0.75rem",fontWeight:"500"},templateCategory:{display:"flex",alignItems:"center",gap:"0.5rem",fontSize:"0.875rem",color:"#64748b"},categoryDot:{width:"8px",height:"8px",borderRadius:"50%"},templateActions:{padding:"1rem 1.5rem",borderTop:"1px solid #f1f5f9",display:"flex",gap:"0.5rem"},btnPreview:{flex:1,padding:"0.5rem 1rem",border:"1px solid #e2e8f0",borderRadius:"0.375rem",background:"white",color:"#475569",fontSize:"0.875rem",fontWeight:"500",cursor:"pointer",transition:"all 0.2s ease"},btnExport:{flex:1,padding:"0.5rem 1rem",border:"1px solid #e2e8f0",borderRadius:"0.375rem",background:"white",color:"#475569",fontSize:"0.875rem",fontWeight:"500",cursor:"pointer",transition:"all 0.2s ease"},emptyState:{textAlign:"center",padding:"4rem 2rem",color:"#64748b"},emptyIcon:{fontSize:"4rem",marginBottom:"1rem",opacity:.5},emptyTitle:{margin:"0 0 0.5rem 0",color:"#475569"},emptyText:{margin:"0 0 2rem 0"},footer:{background:"white",borderTop:"1px solid #e2e8f0",padding:"3rem 0",marginTop:"4rem"},footerContent:{maxWidth:"1200px",margin:"0 auto",padding:"0 2rem",textAlign:"center"},footerTitle:{color:"#1e293b",margin:"0 0 2rem 0",fontSize:"1.5rem"},footerTips:{display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(250px, 1fr))",gap:"2rem",maxWidth:"800px",margin:"0 auto"},tip:{textAlign:"center"},tipTitle:{display:"block",color:"#3b82f6",marginBottom:"0.5rem",fontSize:"1.1rem"},tipText:{color:"#64748b",margin:0,fontSize:"0.9rem"}},s={btnPrimary:{transform:"translateY(-2px)",boxShadow:"0 4px 12px rgba(59, 130, 246, 0.3)"},btnSecondary:{background:"#e2e8f0",borderColor:"#cbd5e1"},btnOutline:{background:"#3b82f6",color:"white"},categoryFilter:{borderColor:"#cbd5e1",background:"#f8fafc"},templateCard:{transform:"translateY(-4px)",boxShadow:"0 12px 25px rgba(0, 0, 0, 0.1)"},btnPreview:{background:"#f8fafc",borderColor:"#cbd5e1"},btnExport:{background:"#3b82f6",color:"white",borderColor:"#3b82f6"}};return o("div",{style:t.container,children:[i("div",{style:t.header,children:o("div",{style:t.headerContent,children:[o("div",{style:t.headerText,children:[i("h1",{style:t.headerTitle,children:"Resume Templates"}),i("p",{style:t.headerSubtitle,children:"Choose from 20 professionally designed templates to showcase your career story"})]}),i("div",{style:t.headerActions,children:i("button",{style:t.btnPrimary,onClick:()=>g("/builder"),onMouseEnter:e=>Object.assign(e.target.style,s.btnPrimary),onMouseLeave:e=>Object.assign(e.target.style,t.btnPrimary),children:"← Back to Builder"})})]})}),o("div",{style:t.filtersSection,children:[o("div",{style:t.searchBox,children:[i("input",{type:"text",placeholder:"Search templates...",value:p,onChange:e=>y(e.target.value),style:t.searchInput}),i("span",{style:t.searchIcon,children:"🔍"})]}),i("div",{style:t.categoryFilters,children:Object.entries(u).map(([e,r])=>o("button",{style:{...t.categoryFilter,...c===e&&t.categoryFilterActive},onClick:()=>b(e),onMouseEnter:n=>c!==e&&Object.assign(n.target.style,s.categoryFilter),onMouseLeave:n=>c!==e&&Object.assign(n.target.style,t.categoryFilter),children:[r," (",j(e),")"]},e))})]}),a&&i("div",{style:t.selectedBanner,children:o("div",{style:t.bannerContent,children:[o("div",{style:t.bannerInfo,children:[i("span",{style:t.bannerIcon,children:a.icon}),o("div",{children:[i("h3",{style:t.bannerTitle,children:a.name}),i("p",{style:t.bannerDescription,children:a.description})]})]}),o("div",{style:t.bannerActions,children:[i("button",{style:t.btnSecondary,onClick:()=>v(a),onMouseEnter:e=>Object.assign(e.target.style,s.btnSecondary),onMouseLeave:e=>Object.assign(e.target.style,t.btnSecondary),children:"Preview"}),l&&i("button",{style:t.btnOutline,onClick:()=>w(a),onMouseEnter:e=>Object.assign(e.target.style,s.btnOutline),onMouseLeave:e=>Object.assign(e.target.style,t.btnOutline),children:"Quick Export"}),i("button",{style:t.btnPrimary,onClick:M,onMouseEnter:e=>Object.assign(e.target.style,s.btnPrimary),onMouseLeave:e=>Object.assign(e.target.style,t.btnPrimary),children:"Use This Template"})]})]})}),i("div",{style:t.templatesGrid,children:x.map(e=>o("div",{style:{...t.templateCard,...(a==null?void 0:a.id)===e.id&&t.templateCardSelected},onClick:()=>E(e),onMouseEnter:r=>(a==null?void 0:a.id)!==e.id&&Object.assign(r.target.style,s.templateCard),onMouseLeave:r=>(a==null?void 0:a.id)!==e.id&&Object.assign(r.target.style,t.templateCard),children:[o("div",{style:{...t.templateHeader,backgroundColor:e.color},children:[i("span",{style:t.templateIcon,children:e.icon}),o("div",{style:t.templateBadge,children:[e.popularity,"% Popular"]})]}),o("div",{style:t.templateContent,children:[i("h3",{style:t.templateName,children:e.name}),i("p",{style:t.templateDescription,children:e.description}),i("div",{style:t.templateTags,children:e.tags.map((r,n)=>o("span",{style:t.tag,children:["#",r]},n))}),o("div",{style:t.templateCategory,children:[i("span",{style:{...t.categoryDot,backgroundColor:e.color}}),u[e.category]]})]}),o("div",{style:t.templateActions,children:[i("button",{style:t.btnPreview,onClick:r=>{r.stopPropagation(),v(e)},onMouseEnter:r=>Object.assign(r.target.style,s.btnPreview),onMouseLeave:r=>Object.assign(r.target.style,t.btnPreview),children:"👁️ Preview"}),l&&i("button",{style:t.btnExport,onClick:r=>{r.stopPropagation(),w(e)},onMouseEnter:r=>Object.assign(r.target.style,s.btnExport),onMouseLeave:r=>Object.assign(r.target.style,t.btnExport),children:"📥 Export"})]})]},e.id))}),x.length===0&&o("div",{style:t.emptyState,children:[i("div",{style:t.emptyIcon,children:"🔍"}),i("h3",{style:t.emptyTitle,children:"No templates found"}),i("p",{style:t.emptyText,children:"Try adjusting your search or filter criteria"}),i("button",{style:t.btnPrimary,onClick:()=>{y(""),b("all")},onMouseEnter:e=>Object.assign(e.target.style,s.btnPrimary),onMouseLeave:e=>Object.assign(e.target.style,t.btnPrimary),children:"Clear Filters"})]}),i("div",{style:t.footer,children:o("div",{style:t.footerContent,children:[i("h3",{style:t.footerTitle,children:"Need help choosing?"}),o("div",{style:t.footerTips,children:[o("div",{style:t.tip,children:[i("strong",{style:t.tipTitle,children:"Professional Templates"}),i("p",{style:t.tipText,children:"Best for corporate, business, and traditional roles"})]}),o("div",{style:t.tip,children:[i("strong",{style:t.tipTitle,children:"Creative Templates"}),i("p",{style:t.tipText,children:"Ideal for designers, artists, and creative fields"})]}),o("div",{style:t.tip,children:[i("strong",{style:t.tipTitle,children:"Minimal Templates"}),i("p",{style:t.tipText,children:"Perfect for ATS systems and clean presentation"})]})]})]})}),i("style",{children:`
                    @keyframes fadeInUp {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }

                    .template-card-animation {
                        animation: fadeInUp 0.5s ease forwards;
                    }

                    @media (max-width: 768px) {
                        .header-content {
                            flex-direction: column;
                            text-align: center;
                        }
                        
                        .header-title {
                            font-size: 2rem;
                        }
                        
                        .templates-grid {
                            grid-template-columns: 1fr;
                            padding: 1rem;
                        }
                        
                        .banner-content {
                            flex-direction: column;
                            align-items: stretch;
                        }
                        
                        .banner-actions {
                            justify-content: center;
                        }
                        
                        .category-filters {
                            justify-content: center;
                        }
                        
                        .filters-section {
                            padding: 0 1rem;
                        }
                    }

                    @media (max-width: 480px) {
                        .template-actions {
                            flex-direction: column;
                        }
                        
                        .banner-actions {
                            flex-direction: column;
                        }
                        
                        .banner-actions button {
                            width: 100%;
                        }
                    }
                `})]})};export{F as default};
//# sourceMappingURL=TemplateSelect-7313824f.js.map
