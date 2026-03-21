const INIT_SCRIPT = `if(window.trustedTypes&&window.trustedTypes.createPolicy){window.trustedTypes.createPolicy("default",{createHTML:function(s){return s},createScript:function(s){return s},createScriptURL:function(s){return s}})}`;

export const TrustedTypesInit = () => {
  return <script dangerouslySetInnerHTML={{ __html: INIT_SCRIPT }} />;
};
