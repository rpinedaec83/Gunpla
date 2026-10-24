[CmdletBinding()]
param(
    [Parameter()]
    [string]$TargetPath = (Get-Location).Path,

    [Parameter()]
    [string]$ManifestPath,

    [Parameter()]
    [switch]$SourceKit
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$errors = [System.Collections.Generic.List[string]]::new()
$warnings = [System.Collections.Generic.List[string]]::new()

function Add-ValidationError {
    param([string]$Message)
    $errors.Add($Message)
}

function Add-ValidationWarning {
    param([string]$Message)
    $warnings.Add($Message)
}

function Test-ObjectProperty {
    param(
        [object]$Object,
        [string]$Name
    )

    return $null -ne $Object -and $null -ne $Object.PSObject.Properties[$Name]
}

function Get-FullPath {
    param(
        [string]$Root,
        [string]$RelativePath
    )

    $nativePath = $RelativePath.Replace('/', [IO.Path]::DirectorySeparatorChar)
    return [IO.Path]::GetFullPath((Join-Path $Root $nativePath))
}

function Get-RelativePath {
    param(
        [string]$BasePath,
        [string]$TargetPath
    )

    $fullBase = [System.IO.Path]::GetFullPath($BasePath).TrimEnd([System.IO.Path]::DirectorySeparatorChar, [System.IO.Path]::AltDirectorySeparatorChar)
    $fullTarget = [System.IO.Path]::GetFullPath($TargetPath)

    if ($fullTarget.StartsWith($fullBase + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)) {
        return $fullTarget.Substring($fullBase.Length + 1).Replace('\', '/')
    }

    $baseUri = [System.Uri]($fullBase + [System.IO.Path]::DirectorySeparatorChar)
    $targetUri = [System.Uri]$fullTarget
    return [System.Uri]::UnescapeDataString($baseUri.MakeRelativeUri($targetUri).ToString()).Replace('\', '/')
}

function Test-RequiredPath {
    param(
        [string]$Root,
        [string]$RelativePath
    )

    if (-not (Test-Path -LiteralPath (Get-FullPath -Root $Root -RelativePath $RelativePath))) {
        Add-ValidationError "Missing required path: $RelativePath"
    }
}

function Get-GroupRequiredPaths {
    param(
        [object]$Manifest,
        [string[]]$GroupNames
    )

    $paths = [System.Collections.Generic.List[string]]::new()
    foreach ($groupName in $GroupNames) {
        $groupProperty = $Manifest.groups.PSObject.Properties[$groupName]
        if ($null -eq $groupProperty) {
            Add-ValidationError "Manifest references unknown group: $groupName"
            continue
        }

        foreach ($path in @($groupProperty.Value.requiredPaths)) {
            if (-not $paths.Contains([string]$path)) {
                $paths.Add([string]$path)
            }
        }
    }

    return $paths
}

try {
    $resolvedTarget = (Resolve-Path -LiteralPath $TargetPath).Path
} catch {
    Write-Error "Target path does not exist: $TargetPath"
    exit 1
}

if ([string]::IsNullOrWhiteSpace($ManifestPath)) {
    $ManifestPath = Join-Path $resolvedTarget '.atlas/install-manifest.json'
}

try {
    $resolvedManifest = (Resolve-Path -LiteralPath $ManifestPath).Path
    $manifest = Get-Content -LiteralPath $resolvedManifest -Raw | ConvertFrom-Json
} catch {
    Write-Error "Cannot read Atlas install manifest: $ManifestPath. $($_.Exception.Message)"
    exit 1
}

if (-not (Test-ObjectProperty -Object $manifest -Name 'schemaVersion') -or $manifest.schemaVersion -ne 1) {
    Add-ValidationError 'Manifest schemaVersion must be 1.'
}
if (-not (Test-ObjectProperty -Object $manifest -Name 'manifestVersion') -or ($manifest.manifestVersion -isnot [int] -and $manifest.manifestVersion -isnot [long]) -or $manifest.manifestVersion -lt 1) {
    Add-ValidationError 'Manifest manifestVersion must be a positive integer.'
}

$questionnaireKeys = @($manifest.questionnaire | ForEach-Object { [string]$_.key })
$expectedQuestionnaireKeys = @(
    'scaffold',
    'initializeGit',
    'includePS',
    'includeCGR',
    'stackPattern',
    'apiFirst',
    'uxPattern',
    'createGitHubRepository'
)
$duplicateQuestionnaireKeys = @($questionnaireKeys | Group-Object | Where-Object Count -gt 1)
foreach ($duplicate in $duplicateQuestionnaireKeys) {
    Add-ValidationError "Duplicate questionnaire key in manifest: $($duplicate.Name)"
}
foreach ($expectedKey in $expectedQuestionnaireKeys) {
    if ($expectedKey -notin $questionnaireKeys) {
        Add-ValidationError "Manifest is missing questionnaire key: $expectedKey"
    }
}
foreach ($manifestKey in $questionnaireKeys) {
    if ($manifestKey -notin $expectedQuestionnaireKeys) {
        Add-ValidationError "Manifest has unsupported questionnaire key: $manifestKey"
    }
}
foreach ($question in @($manifest.questionnaire)) {
    $declaredTypes = @($question.type | ForEach-Object { [string]$_ })
    foreach ($declaredType in $declaredTypes) {
        if ($declaredType -notin @('boolean', 'string', 'null')) {
            Add-ValidationError "Questionnaire key $($question.key) has unsupported type: $declaredType"
        }
    }
    if ($null -eq $question.default) {
        if ('null' -notin $declaredTypes) {
            Add-ValidationError "Questionnaire key $($question.key) has a null default without declaring null."
        }
    } elseif ($question.default -is [bool]) {
        if ('boolean' -notin $declaredTypes) {
            Add-ValidationError "Questionnaire key $($question.key) has a boolean default without declaring boolean."
        }
    } elseif ($question.default -is [string]) {
        if ('string' -notin $declaredTypes) {
            Add-ValidationError "Questionnaire key $($question.key) has a string default without declaring string."
        }
    } else {
        Add-ValidationError "Questionnaire key $($question.key) has an unsupported default value type."
    }
}

foreach ($catalogName in @('stackPatterns', 'uxPatterns')) {
    $catalog = @($manifest.catalogs.PSObject.Properties[$catalogName].Value)
    foreach ($field in @('number', 'id', 'label', 'sourcePath')) {
        $duplicates = @($catalog | Group-Object -Property $field | Where-Object Count -gt 1)
        foreach ($duplicate in $duplicates) {
            Add-ValidationError "Duplicate $field in $catalogName catalog: $($duplicate.Name)"
        }
    }
    $orderedNumbers = @($catalog | Sort-Object number | ForEach-Object { [int]$_.number })
    for ($index = 0; $index -lt $orderedNumbers.Count; $index++) {
        if ($orderedNumbers[$index] -ne ($index + 1)) {
            Add-ValidationError "$catalogName catalog numbers must be sequential starting at 1."
            break
        }
    }
    foreach ($entry in $catalog) {
        if ([IO.Path]::GetFileNameWithoutExtension([string]$entry.sourcePath) -ne [string]$entry.id) {
            Add-ValidationError "Catalog ID must match its source filename: $($entry.id)"
        }
    }
}

if ($SourceKit) {
    $allGroups = @($manifest.groups.PSObject.Properties.Name)
    foreach ($path in (Get-GroupRequiredPaths -Manifest $manifest -GroupNames $allGroups)) {
        Test-RequiredPath -Root $resolvedTarget -RelativePath $path
    }

    foreach ($catalogName in @('stackPatterns', 'uxPatterns')) {
        foreach ($entry in @($manifest.catalogs.PSObject.Properties[$catalogName].Value)) {
            Test-RequiredPath -Root $resolvedTarget -RelativePath ([string]$entry.sourcePath)
            if (Test-ObjectProperty -Object $entry -Name 'group') {
                if ($null -eq $manifest.groups.PSObject.Properties[[string]$entry.group]) {
                    Add-ValidationError "Catalog entry $($entry.id) references unknown group: $($entry.group)"
                }
            }
        }
    }

    $catalogDirectoryChecks = @(
        [pscustomobject]@{
            Directory = 'patterns/stack-patterns/stack-pattern-templates'
            Filter = 'sp-*.md'
            Catalog = @($manifest.catalogs.stackPatterns)
        },
        [pscustomobject]@{
            Directory = 'patterns/ux-patterns/ux-pattern-templates'
            Filter = 'uxp-*.md'
            Catalog = @($manifest.catalogs.uxPatterns)
        }
    )
    foreach ($check in $catalogDirectoryChecks) {
        $catalogPaths = @($check.Catalog | ForEach-Object { [string]$_.sourcePath })
        $catalogDirectory = Get-FullPath -Root $resolvedTarget -RelativePath $check.Directory
        foreach ($templateFile in Get-ChildItem -LiteralPath $catalogDirectory -File -Filter $check.Filter) {
            $relativeTemplatePath = Get-RelativePath -BasePath $resolvedTarget -TargetPath $templateFile.FullName
            if ($relativeTemplatePath -notin $catalogPaths) {
                Add-ValidationError "Pattern template is not registered in the manifest catalog: $relativeTemplatePath"
            }
        }
    }

    $corePaths = @($manifest.groups.core.requiredPaths)
    foreach ($baseSkill in @('devcycle-management', 'git-workflow', 'model-tier-advisor', 'powershell-style', 'project-setup', 'requirements-writing')) {
        $baseSkillPath = ".github/skills/$baseSkill/SKILL.md"
        if ($baseSkillPath -notin $corePaths) {
            Add-ValidationError "Base skill is not included in the core install group: $baseSkillPath"
        }
    }
} else {
    $receiptPath = Get-FullPath -Root $resolvedTarget -RelativePath ([string]$manifest.receiptPath)
    try {
        $receipt = Get-Content -LiteralPath $receiptPath -Raw | ConvertFrom-Json
    } catch {
        Add-ValidationError "Cannot read setup receipt: $($manifest.receiptPath). $($_.Exception.Message)"
        $receipt = $null
    }

    if ($null -ne $receipt) {
        if (-not (Test-ObjectProperty -Object $receipt -Name 'schemaVersion') -or $receipt.schemaVersion -ne 1) {
            Add-ValidationError 'Setup receipt schemaVersion must be 1.'
        }
        if (-not (Test-ObjectProperty -Object $receipt -Name 'manifestVersion') -or $receipt.manifestVersion -ne $manifest.manifestVersion) {
            Add-ValidationError 'Setup receipt manifestVersion must match the install manifest manifestVersion.'
        }
        if (-not (Test-ObjectProperty -Object $receipt -Name 'source')) {
            Add-ValidationError 'Setup receipt is missing source.'
        } else {
            if (-not (Test-ObjectProperty -Object $receipt.source -Name 'repository') -or $receipt.source.repository -ne $manifest.kit.repository) {
                Add-ValidationError "Setup receipt source.repository must be $($manifest.kit.repository)."
            }
            if (-not (Test-ObjectProperty -Object $receipt.source -Name 'revision') -or [string]::IsNullOrWhiteSpace([string]$receipt.source.revision)) {
                Add-ValidationError 'Setup receipt source.revision must be recorded.'
            }
        }
        if (-not (Test-ObjectProperty -Object $receipt -Name 'answers')) {
            Add-ValidationError 'Setup receipt is missing answers.'
        } else {
            $answersComplete = $true
            foreach ($key in $questionnaireKeys) {
                if (-not (Test-ObjectProperty -Object $receipt.answers -Name $key)) {
                    Add-ValidationError "Setup receipt is missing questionnaire answer: $key"
                    $answersComplete = $false
                }
            }
        }
        if (-not (Test-ObjectProperty -Object $receipt -Name 'relocatedRootEntries')) {
            Add-ValidationError 'Setup receipt is missing relocatedRootEntries.'
        }
        if (-not (Test-ObjectProperty -Object $receipt -Name 'outcomes')) {
            Add-ValidationError 'Setup receipt is missing outcomes.'
        } else {
            if (-not (Test-ObjectProperty -Object $receipt.outcomes -Name 'git') -or $receipt.outcomes.git -notin @('adopted', 'initialized', 'skipped')) {
                Add-ValidationError 'Setup receipt outcomes.git must be adopted, initialized, or skipped.'
            }
            if (-not (Test-ObjectProperty -Object $receipt.outcomes -Name 'github') -or $receipt.outcomes.github -notin @('created', 'existing', 'skipped', 'blocked')) {
                Add-ValidationError 'Setup receipt outcomes.github must be created, existing, skipped, or blocked.'
            }
        }
    }

    if ($null -ne $receipt -and (Test-ObjectProperty -Object $receipt -Name 'answers') -and $answersComplete -eq $true) {
        $answers = $receipt.answers
        foreach ($booleanKey in @('scaffold', 'initializeGit', 'includePS', 'includeCGR', 'createGitHubRepository')) {
            if ((Test-ObjectProperty -Object $answers -Name $booleanKey) -and $answers.$booleanKey -isnot [bool]) {
                Add-ValidationError "Questionnaire answer $booleanKey must be boolean."
            }
        }

        $stackSelection = $null
        if (Test-ObjectProperty -Object $answers -Name 'stackPattern') {
            $stackSelection = $answers.stackPattern
        }
        $uxSelection = $null
        if (Test-ObjectProperty -Object $answers -Name 'uxPattern') {
            $uxSelection = $answers.uxPattern
        }

        $selectedStack = $null
        if ($null -ne $stackSelection) {
            if ($stackSelection -isnot [string]) {
                Add-ValidationError 'stackPattern must be a catalog ID string or null.'
            }
            $selectedStack = @($manifest.catalogs.stackPatterns | Where-Object id -eq $stackSelection)
            if ($selectedStack.Count -ne 1) {
                Add-ValidationError "Unknown stackPattern selection: $stackSelection"
                $selectedStack = $null
            } else {
                $selectedStack = $selectedStack[0]
            }
            if (-not (Test-ObjectProperty -Object $answers -Name 'apiFirst') -or $answers.apiFirst -isnot [bool]) {
                Add-ValidationError 'apiFirst must be boolean when a stackPattern is selected.'
            }
        } elseif ((Test-ObjectProperty -Object $answers -Name 'apiFirst') -and $null -ne $answers.apiFirst) {
            Add-ValidationError 'apiFirst must be null when no stackPattern is selected.'
        }

        $selectedUx = $null
        if ($null -ne $uxSelection) {
            if ($uxSelection -isnot [string]) {
                Add-ValidationError 'uxPattern must be a catalog ID string or null.'
            }
            $selectedUx = @($manifest.catalogs.uxPatterns | Where-Object id -eq $uxSelection)
            if ($selectedUx.Count -ne 1) {
                Add-ValidationError "Unknown uxPattern selection: $uxSelection"
                $selectedUx = $null
            } else {
                $selectedUx = $selectedUx[0]
            }
        }

        $selectedGroups = [System.Collections.Generic.List[string]]::new()
        $selectedGroups.Add('core')
        if ($answers.scaffold -eq $true) { $selectedGroups.Add('scaffold') }
        if ($answers.includeCGR -eq $true) { $selectedGroups.Add('cgr') }
        if ($answers.includePS -eq $true) { $selectedGroups.Add('ps') }
        if ($null -ne $selectedStack -and (Test-ObjectProperty -Object $selectedStack -Name 'group')) {
            $selectedGroups.Add([string]$selectedStack.group)
        }

        $selectedRequiredPaths = Get-GroupRequiredPaths -Manifest $manifest -GroupNames $selectedGroups
        foreach ($path in $selectedRequiredPaths) {
            Test-RequiredPath -Root $resolvedTarget -RelativePath $path
        }
        foreach ($path in @($manifest.groups.core.generatedPaths)) {
            Test-RequiredPath -Root $resolvedTarget -RelativePath ([string]$path)
        }

        if ($null -ne $selectedStack) {
            $activeStackPath = Get-FullPath -Root $resolvedTarget -RelativePath ([string]$selectedStack.destinationPath)
            Test-RequiredPath -Root $resolvedTarget -RelativePath ([string]$selectedStack.destinationPath)
            if (Test-Path -LiteralPath $activeStackPath) {
                $activeStack = Get-Content -LiteralPath $activeStackPath -Raw
                if ($activeStack -notmatch "(?m)^Atlas Pattern ID:\s*$([regex]::Escape([string]$selectedStack.id))\s*$") {
                    Add-ValidationError "Active stack pattern does not record Atlas Pattern ID: $($selectedStack.id)"
                }
                $expectedApiFirst = if ($answers.apiFirst) { 'Enabled' } else { 'Disabled' }
                if ($activeStack -notmatch "(?m)^API-First:\s*$expectedApiFirst\s*$") {
                    Add-ValidationError "Active stack pattern must record API-First: $expectedApiFirst"
                }
            }
        }

        if ($null -ne $selectedUx) {
            $activeUxPath = Get-FullPath -Root $resolvedTarget -RelativePath ([string]$selectedUx.destinationPath)
            Test-RequiredPath -Root $resolvedTarget -RelativePath ([string]$selectedUx.destinationPath)
            if (Test-Path -LiteralPath $activeUxPath) {
                $activeUx = Get-Content -LiteralPath $activeUxPath -Raw
                if ($activeUx -notmatch "(?m)^Atlas Pattern ID:\s*$([regex]::Escape([string]$selectedUx.id))\s*$") {
                    Add-ValidationError "Active UX pattern does not record Atlas Pattern ID: $($selectedUx.id)"
                }
            }
        }

        $selectedPathSet = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
        foreach ($path in $selectedRequiredPaths) { [void]$selectedPathSet.Add([string]$path) }
        foreach ($optionalGroupName in @('scaffold', 'cgr', 'ps', 'azureStack')) {
            if ($selectedGroups.Contains($optionalGroupName)) { continue }
            foreach ($path in @($manifest.groups.PSObject.Properties[$optionalGroupName].Value.requiredPaths)) {
                if (-not $selectedPathSet.Contains([string]$path) -and
                    (Test-Path -LiteralPath (Get-FullPath -Root $resolvedTarget -RelativePath ([string]$path)))) {
                    Add-ValidationError "Path is present but its setup option is not selected: $path"
                }
            }
        }
        if ($null -eq $selectedStack) {
            $activeStackDestination = [string]$manifest.catalogs.stackPatterns[0].destinationPath
            if (Test-Path -LiteralPath (Get-FullPath -Root $resolvedTarget -RelativePath $activeStackDestination)) {
                Add-ValidationError "Path is present but no stackPattern is selected: $activeStackDestination"
            }
        }
        if ($null -eq $selectedUx) {
            $activeUxDestination = [string]$manifest.catalogs.uxPatterns[0].destinationPath
            if (Test-Path -LiteralPath (Get-FullPath -Root $resolvedTarget -RelativePath $activeUxDestination)) {
                Add-ValidationError "Path is present but no uxPattern is selected: $activeUxDestination"
            }
        }

        $allowedRoot = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
        foreach ($entry in @($manifest.allowedRootEntries.always) + @($manifest.allowedRootEntries.gitMetadata)) {
            [void]$allowedRoot.Add([string]$entry)
        }
        if ($answers.scaffold -eq $true) {
            foreach ($entry in @($manifest.allowedRootEntries.scaffold)) { [void]$allowedRoot.Add([string]$entry) }
        }
        if ($answers.includeCGR -eq $true) {
            foreach ($entry in @($manifest.allowedRootEntries.cgr)) { [void]$allowedRoot.Add([string]$entry) }
        }
        if ($null -ne $selectedStack) {
            foreach ($entry in @($manifest.allowedRootEntries.stackPattern)) { [void]$allowedRoot.Add([string]$entry) }
        }
        if ($null -ne $selectedUx) {
            foreach ($entry in @($manifest.allowedRootEntries.uxPattern)) { [void]$allowedRoot.Add([string]$entry) }
        }

        foreach ($entry in Get-ChildItem -LiteralPath $resolvedTarget -Force) {
            if (-not $allowedRoot.Contains($entry.Name)) {
                Add-ValidationError "Unexpected root entry: $($entry.Name)"
            }
        }

        foreach ($sourceKitName in @($manifest.temporarySourceKitNames)) {
            if (Test-Path -LiteralPath (Join-Path $resolvedTarget ([string]$sourceKitName))) {
                Add-ValidationError "Temporary source-kit directory remains in target root: $sourceKitName"
            }
        }

        if (Test-ObjectProperty -Object $receipt -Name 'relocatedRootEntries') {
            $relocatedEntries = @($receipt.relocatedRootEntries)
            $duplicates = @($relocatedEntries | Group-Object | Where-Object Count -gt 1)
            foreach ($duplicate in $duplicates) {
                Add-ValidationError "Duplicate relocatedRootEntries value: $($duplicate.Name)"
            }
            foreach ($relocatedEntry in $relocatedEntries) {
                if ([string]::IsNullOrWhiteSpace([string]$relocatedEntry)) {
                    Add-ValidationError 'relocatedRootEntries cannot contain an empty path.'
                    continue
                }
                if ([IO.Path]::GetFileName([string]$relocatedEntry) -ne [string]$relocatedEntry) {
                    Add-ValidationError "relocatedRootEntries must contain root entry names, not paths: $relocatedEntry"
                    continue
                }
                $preservedPath = "docs/reference/preexisting-root/$relocatedEntry"
                Test-RequiredPath -Root $resolvedTarget -RelativePath $preservedPath
            }
            $preservationRoot = Get-FullPath -Root $resolvedTarget -RelativePath 'docs/reference/preexisting-root'
            if (Test-Path -LiteralPath $preservationRoot) {
                foreach ($preservedEntry in Get-ChildItem -LiteralPath $preservationRoot -Force) {
                    if ($preservedEntry.Name -notin $relocatedEntries) {
                        Add-ValidationError "Preserved root entry is not recorded in relocatedRootEntries: $($preservedEntry.Name)"
                    }
                }
            }
        }

        $hasGitDirectory = Test-Path -LiteralPath (Join-Path $resolvedTarget '.git')
        if ($answers.initializeGit -eq $true) {
            if (-not $hasGitDirectory) {
                Add-ValidationError 'initializeGit is true, but .git is missing.'
            }
            if ($receipt.outcomes.git -ne 'initialized') {
                Add-ValidationError 'initializeGit is true, so outcomes.git must be initialized.'
            }
        } elseif ($hasGitDirectory -and $receipt.outcomes.git -ne 'adopted') {
            Add-ValidationError 'An existing .git directory requires outcomes.git to be adopted.'
        } elseif (-not $hasGitDirectory -and $receipt.outcomes.git -ne 'skipped') {
            Add-ValidationError 'When git is absent and initialization is not selected, outcomes.git must be skipped.'
        }

        if ($answers.createGitHubRepository -eq $true -and $receipt.outcomes.github -notin @('created', 'blocked')) {
            Add-ValidationError 'createGitHubRepository is true, so outcomes.github must be created or blocked.'
        }
        if ($answers.createGitHubRepository -eq $false -and $receipt.outcomes.github -notin @('existing', 'skipped')) {
            Add-ValidationError 'createGitHubRepository is false, so outcomes.github must be existing or skipped.'
        }
    }

    $gitIgnorePath = Join-Path $resolvedTarget '.gitignore'
    if (Test-Path -LiteralPath $gitIgnorePath) {
        $gitIgnore = Get-Content -LiteralPath $gitIgnorePath -Raw
        if ($gitIgnore -notmatch '(?m)^secrets\.md\s*$') {
            Add-ValidationError '.gitignore must contain an exact secrets.md entry.'
        }
    }

    if (Test-Path -LiteralPath (Join-Path $resolvedTarget '.git')) {
        if (Get-Command git -ErrorAction SilentlyContinue) {
            $prevEap = $ErrorActionPreference
            $ErrorActionPreference = 'Continue'
            & git -C $resolvedTarget rev-parse --is-inside-work-tree 2>$null *> $null
            $insideWorkTree = ($LASTEXITCODE -eq 0)
            if (-not $insideWorkTree) {
                Add-ValidationError 'Unable to inspect git tracking state for secrets.md.'
            } else {
                & git -C $resolvedTarget ls-files --error-unmatch secrets.md 2>$null *> $null
                if ($LASTEXITCODE -eq 0) {
                    Add-ValidationError 'secrets.md is tracked by git.'
                }
            }
            $ErrorActionPreference = $prevEap
        } else {
            Add-ValidationError 'Git is unavailable, so tracked secrets.md status cannot be validated.'
        }
    }
}

foreach ($warning in $warnings) {
    Write-Warning $warning
}

if ($errors.Count -gt 0) {
    foreach ($validationError in $errors) {
        Write-Error $validationError -ErrorAction Continue
    }
    Write-Output "Atlas validation failed with $($errors.Count) error(s)."
    exit 1
}

$mode = if ($SourceKit) { 'source kit' } else { 'installed project' }
Write-Output "Atlas validation passed for $mode at $resolvedTarget."
exit 0
