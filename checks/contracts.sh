#!/bin/sh
set -eu
: "${CORE_DIR:?reviewed public core checkout required}"
source_root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd -P)
work=$(mktemp -d "${TMPDIR:-/tmp}/next-contracts.XXXXXXXX")
trap 'rm -rf -- "$work"' EXIT HUP INT TERM
cat > "$work/next55_contract_test.go" <<'GO'
package main
import("bytes";"crypto/sha256";"encoding/hex";"encoding/json";"os";"path/filepath";"testing";"github.com/tplAIter/tplaiter/internal/blockexport";"github.com/tplAIter/tplaiter/internal/exports";"github.com/tplAIter/tplaiter/internal/manifest")
func TestNext55ContentContracts(t *testing.T){
 root:=os.Getenv("NEXT_SOURCE");read:=func(p string)[]byte{t.Helper();b,e:=os.ReadFile(filepath.Join(root,p));if e!=nil{t.Fatal(e)};return b}
 tpl,e:=manifest.LoadTemplate(filepath.Join(root,"template.manifest.yaml"));if e!=nil{t.Fatal(e)};if len(tpl.Generators)!=6{t.Fatal("six actual generator families required")}
 for _,name:=range []string{"router","packages","app-build","generator-routing","server-data","skills"}{raw:=read("exports/next-"+name+".payload.json");p,e:=exports.ParseExportPayload(raw);if e!=nil{t.Fatal(name,e)};for _,f:=range p.Files{sum:=sha256.Sum256(read(f.SourcePath));if f.ContentSHA256!="sha256:"+hex.EncodeToString(sum[:]){t.Fatal("source digest",f.SourcePath)}};for _,b:=range p.Blocks{sum:=sha256.Sum256(read(b.SourcePath));if b.ContentSHA256!="sha256:"+hex.EncodeToString(sum[:]){t.Fatal("descriptor digest",b.SourcePath)}};var fields map[string]any;if e:=json.Unmarshal(raw,&fields);e!=nil{t.Fatal(e)};fields["authority"]=true;bad,_:=json.Marshal(fields);if _,e:=exports.ParseExportPayload(bad);e==nil{t.Fatal("open payload accepted")}}
 for _,name:=range []string{"router","server-data"}{b,e:=blockexport.Parse(read("block-exports/next-"+name+".yaml"));if e!=nil{t.Fatal(e)};if _,e:=blockexport.Resolve([]blockexport.BlockExport{b});e!=nil{t.Fatal(e)};for _,target:=range b.Targets{for _,block:=range target.Blocks{if len(read(block.Body))==0{t.Fatal("empty block")}}}}
 var output bytes.Buffer;if e:=runWithPreflight(root,filepath.Join(t.TempDir(),"render"),"",true,true,&output,&output);e!=nil{t.Fatal(e)}
 if _,e:=os.Stat(filepath.Join(root,"modifier.manifest.json"));!os.IsNotExist(e){t.Fatal("stage1 cannot pretend a publication-bound descriptor exists")}
}
GO
python3 -B - "$CORE_DIR" "$work" <<'PYTHON'
import json,sys
from pathlib import Path
core=Path(sys.argv[1]).resolve();work=Path(sys.argv[2]);(work/'overlay.json').write_text(json.dumps({'Replace':{str(core/'cmd/templatecheck/next55_contract_test.go'):str(work/'next55_contract_test.go')}}))
PYTHON
cd "$CORE_DIR"
NEXT_SOURCE="$source_root" GOPROXY=off GOSUMDB=off GOTOOLCHAIN=local GOFLAGS=-mod=readonly go test -overlay "$work/overlay.json" -count=1 -run '^TestNext55ContentContracts$' -v ./cmd/templatecheck
