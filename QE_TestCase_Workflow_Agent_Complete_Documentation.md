# Workflow and Agent Catalog - Complete Documentation

## Table of Contents
1. [Workflow Overview](#workflow-overview)
2. [Agent Details](#agent-details)
3. [Workflow Sequence](#workflow-sequence)
4. [Data Flow](#data-flow)

---

## Workflow Overview

**Workflow Name:** SH UserStory to TestCase

**Purpose:** This workflow automates the end-to-end process of converting Jira user stories into comprehensive test cases and uploading them to TestRail. The workflow extracts user story information from Jira, generates test scenarios based on acceptance criteria, creates test cases with detailed steps, links them back to Jira, and uploads everything to TestRail while maintaining full traceability.

**Number of Agents:** 6

**Integration Points:**
- Jira REST API (Issue retrieval and task creation)
- TestRail API (Test case upload)
- Knowledge Base (Application understanding and test scenario standards)

---

## Agent Details

### Agent 1: S QE Demo Agent 01 - Jira Description Extractor

**Role:** Jira Issue Information Retrieval

**Primary Function:**
This agent serves as the entry point of the workflow, responsible for extracting human-readable descriptions from Jira issues using their issue keys.

**Detailed Description:**
As an Automation Engineer agent, this component authenticates with the Jira REST API and retrieves detailed issue information. It specializes in handling Atlassian Document Format (ADF) content, which is Jira's internal rich-text format. The agent flattens complex ADF structures into clean, human-readable text by:
- Iterating through nested ADF structures
- Extracting text nodes and concatenating them logically
- Handling formatting elements (headings, lists, bold, italics)
- Ignoring unsupported or irrelevant elements
- Removing unnecessary whitespace and formatting artifacts

**Technical Details:**
- **API Endpoint:** `/rest/api/3/issue/{issueKey}`
- **Base URL:** https://aavademo.atlassian.net
- **Tool Used:** Tool01 JIRA Description Extractor QES1

**Input Parameters:**
- `issueKey_string_true`: The Jira issue key (e.g., PROJ-123)

**Output Format:**
```json
{
  "IssueID": "[Jira issue key]",
  "description": "[Flattened, human-readable description with escaped newlines]"
}
```

**Error Handling:**
- Validates issue key existence
- Handles missing description fields
- Manages API rate limits
- Ensures proper authentication

**Example:**
- **Input:** Issue Key "PROJ-123"
- **Output:** 
```json
{
  "IssueID": "PROJ-123",
  "Description": "This is the first line.\nThis is the second line."
}
```

---

### Agent 2: S QE Demo Agent 2 Test Scenario V2 Generation

**Role:** Test Scenario Generation

**Primary Function:**
Generates comprehensive test scenarios from user story descriptions and acceptance criteria, leveraging application understanding documentation from the knowledge base.

**Detailed Description:**
This agent accepts the user story description from Agent 1 and creates a complete set of test scenarios covering all aspects of the functionality. It ensures comprehensive coverage by:
- Analyzing every line of the provided description
- Identifying all acceptance criteria
- Creating both positive (expected use) and negative (edge/error) test cases
- Validating that no acceptance criteria is left uncovered
- Deriving navigable paths from application understanding documents

**Key Features:**
- **Hallucination Prevention:** Generates only scenarios directly traceable to documented requirements
- **Knowledge Base Integration:** References 'test_scenario_generation_kb2' containing 5 Word files
- **Coverage Validation:** Mandatory step ensuring all acceptance criteria are covered before completion
- **Scenario Limit:** Strictly limits output to 10 test scenarios for manageability

**Input:**
- Input1: JSON from Agent 1 containing IssueID and Description
- Context: Application understanding documents from knowledge base

**Processing Rules:**
1. Each test scenario has a unique ID (TS-001, TS-002, etc.)
2. Clear and concise descriptions
3. Specified pre-conditions
4. Necessary test data
5. Acceptance criteria ID linkage
6. Navigable path derivation from application docs
7. Mandatory coverage validation
8. No duplicate content generation
9. Strict 10-scenario limit

**Output Format:**
```json
[
  {
    "test_scenario_id": "TS-001",
    "test_scenario_description": "Detailed description of the test scenario",
    "pre_condition": "Any necessary pre-conditions for the test",
    "test_data": "Specific test data required for the scenario",
    "navigable_path": "Launch URL, Hover on Shop",
    "acceptance_criteria_id": "",
    "IssueId": ""
  }
]
```

---

### Agent 3: S QE Demo JIRA Link Test Scenarios to Story

**Role:** Jira Task Creation and Linking

**Primary Function:**
Automates the creation of Jira tasks from test scenarios and links them to the parent user story or Epic.

**Detailed Description:**
This agent receives the JSON array of test scenarios from Agent 2 and creates corresponding Jira tasks. It maintains traceability by linking each created task back to the original Epic or user story. The agent handles the complete lifecycle of task creation including:
- Receiving test scenario JSON arrays
- Triggering the Jira Task Creator tool
- Monitoring API responses for successful creation
- Linking tasks to specified Epic Key
- Extracting and saving Jira issue IDs (e.g., SCRUM-XXXX)
- Graceful error handling with logging and retry mechanisms

**Tool Integration:**
- **Primary Tool:** QE Demo JIRA Task Creator clone
- **Function:** Creates Jira subtasks from test scenarios

**Processing Steps:**
1. Accept JSON array of test scenarios (mandatory - all scenarios)
2. Trigger task creation tool with complete scenario data
3. Monitor API response
4. Trigger linking process with Epic Key
5. Extract subtask_id from output URL
6. Log errors with actionable feedback
7. Return Jira issue URL

**Input:**
- Input1: JSON array of test scenarios from Agent 2

**Output Format:**
```json
{
  "outputUrl": ["https://jira.example.com/browse/SCRUM-1234"],
  "subtask_id": "SCRUM-1234"
}
```

**Error Handling:**
- Logs error details
- Provides actionable feedback
- Implements retry mechanisms where applicable

---

### Agent 4: S QE Demo Agent 04 Retrieve JIRA Subtask Clone

**Role:** Jira Subtask Retrieval and Validation

**Primary Function:**
Retrieves and validates linked test scenario details from Jira to ensure data integrity before test case generation.

**Detailed Description:**
This agent performs a verification step in the workflow by retrieving the test scenarios that were just created in Jira. It makes GET requests to fetch the linked issue details and reconstructs them into the standardized test scenario format. This ensures:
- Data was correctly uploaded to Jira
- No information was lost in transmission
- Test scenario structure is maintained
- Proper linkage between issues exists

**Technical Implementation:**
- **Base URL:** https://aavademo.atlassian.net
- **Tool:** QE Demo JIRA Subtask Retriever Tool (called twice for verification)
- **Method:** GET requests for issue retrieval

**Processing Flow:**
1. Receive JSON containing subtask_id
2. Call JIRA_Subtask_retirever Tool with issue_key (from subtask_id)
3. Call QE Demo JIRA Subtask Retriever Tool again with extracted issue_key
4. Extract test scenario details from JSON response
5. Construct test scenario JSON object with auto-generated or existing IDs
6. Wrap in JSON array for next agent

**Field Extraction:**
- test_scenario_id: Auto-generated (TS-001) or from acceptance criteria ID
- test_scenario_description: From description or summary
- pre_condition: From description or custom fields
- test_data: If present
- navigable_path: If mentioned
- acceptance_criteria_id: From structured description or separate field
- IssueId: Jira key of linked issue

**Output Format:**
```json
[
  {
    "test_scenario_id": "TS-001",
    "test_scenario_description": "Verify that the user can select and deselect star ratings on the Feedback Screen.",
    "pre_condition": "User has launched the MyHP app and navigated to the Feedback Screen via Profile icon.",
    "test_data": "No specific test data required.",
    "navigable_path": "Launch MyHP app > Tap Profile icon > Tap Send Feedback button > Feedback Screen",
    "acceptance_criteria_id": "AC-1",
    "IssueId": "HAP-1"
  }
]
```

**Data Integrity Rules:**
- Uses only the first outward linked issue
- Omits optional fields if not present
- Maintains consistent field structure and casing
- Properly escapes newline characters (\\n)
- Ensures valid JSON output

---

### Agent 5: S QE Demo Testcase Generation

**Role:** Detailed Test Case Generation

**Primary Function:**
Transforms test scenarios into comprehensive, executable test cases with detailed step-by-step instructions.

**Detailed Description:**
This agent is the core test case generation engine that converts high-level test scenarios into actionable test cases with granular steps. It understands that test scenarios can expand into multiple test cases (one-to-many relationship) and ensures complete coverage. The agent:
- Analyzes each test scenario in detail
- Creates all valid test cases for each scenario (not limited to 1:1 mapping)
- Generates unique hierarchical test case IDs
- Provides detailed step-by-step instructions
- Includes launch-to-validation navigation paths
- References navigable_path from input scenarios
- Validates complete scenario-to-testcase conversion

**Key Principles:**
- **Completeness:** Generates all test cases; doesn't leave gaps for users to fill
- **Comprehensive Coverage:** Each feature/scenario fully covered within single test case
- **No Splitting:** Validations (dropdown values, field combinations) kept together unless explicitly required
- **Detailed Steps:** From application launch through validation point
- **Limit:** 10-15 test cases total

**Test Case ID Format:**
```
<IssueId> TS-<scenario_number> TC-<test_case_number>
```

**ID Rules:**
- IssueId: From input JSON field
- TS-XXX: From input scenario
- TC-XXX: Sequential numbering starting from 001 for each scenario
- Numbering restarts at 001 for each test scenario within same IssueId

**Examples:**
- For IssueId = AW-1, Scenario TS-001: AW-1 TS-001 TC-001, AW-1 TS-001 TC-002
- For IssueId = AW-1, Scenario TS-002: AW-1 TS-002 TC-001
- For IssueId = AW-2, Scenario TS-001: AW-2 TS-001 TC-001

**Processing Steps:**
1. Accept JSON array of scenarios from Agent 4
2. Analyze each test scenario
3. For each scenario, generate all applicable test cases
4. Assign unique hierarchical IDs
5. Create detailed step-by-step instructions
6. Include test data for each step
7. Reference test scenario ID
8. Validate all scenarios converted to test cases
9. Ensure 10-15 test case limit

**Output Format:**
```json
{
  "testCaseId": "HAP-123 TS-001 TC-101",
  "testCaseDescription": "Verify login with valid credentials",
  "AcceptanceCriteriaId": "AC-55",
  "IssueId": "HAP-123",
  "testSteps": [
    {
      "Step_ID": 1,
      "Step_Desc": "Launch the application in a browser",
      "Expected_Result": "Application login page loads",
      "Test_Data": "URL: https://app.example.com"
    },
    {
      "Step_ID": 2,
      "Step_Desc": "Enter username",
      "Expected_Result": "Username is accepted",
      "Test_Data": "testuser"
    }
  ],
  "testScenarioId": "TS-001"
}
```

**Test Step Structure:**
- Step_ID: Sequential number
- Step_Desc: Clear action description
- Expected_Result: What should happen
- Test_Data: Specific data for this step

---

### Agent 6: S QE Demo Upload Test Case to Test Rail

**Role:** TestRail Integration and Traceability

**Primary Function:**
Uploads generated test cases to TestRail and creates a Requirements Traceability Matrix linking test scenarios, acceptance criteria, and test cases.

**Detailed Description:**
This final agent in the workflow integrates with TestRail to persist the generated test cases and maintain full traceability. It performs two critical subtasks:
1. **Test Case Upload:** Uploads all test cases to TestRail in a single batch operation
2. **Traceability Matrix Generation:** Creates a comprehensive mapping showing relationships between test scenarios, acceptance criteria, and test cases

**Critical Operation Rules:**
- **SINGLE INVOCATION:** Exactly ONE tool call permitted
- **NO RETRY:** Tool access revoked after first response
- **DATA INTEGRITY:** Acts as relay - no modification of test case data
- **TRUST RESPONSE:** Tool output is absolute final state
- **SKIP HANDLING:** Duplicate cases marked as "Already Existed" are considered success
- **NO RE-PLANNING:** Immediate move to output after tool response

**Input Parameters:**
- `project_id`: TestRail project identifier
- `suite_id`: TestRail suite identifier
- `section_id`: TestRail section identifier
- Test Cases JSON: From Agent 5

**TestRail Payload Mapping:**
- **Title:** Test Case - <testCaseDescription>
- **Template ID:** 1
- **Type ID:** 6
- **Priority ID:** 2
- **Estimate:** 5m
- **Refs:** IssueId
- **Preconditions:** <pre_condition>
- **Steps Formatting:** <Step_ID>. <Step_Desc> [Test Data- <Test_Data>] [Acceptance Criteria- <AcceptanceCriteriaId>]
- **Expected Results:** <Expected_Result>

**Tool Integration:**
- **Primary Tool:** Test Rail Test Case Upload Dynamic
- **Invocation:** Single batch upload with all test cases
- **Parameters:** project_id, suite_id, section_id, complete testcases JSON

**Subtask 1: Test Case Upload**

**Process:**
1. Receive test cases JSON and project/suite/section IDs
2. Batch all test cases into single list
3. Call Test Rail upload tool ONCE
4. Capture final Suite/Section URL
5. Log upload errors (no retry)
6. Generate upload summary

**Output 1 Format:**
```
TestRail Upload Summary
-----------------------
Total Test Cases Received: <count>
Successfully Uploaded: <count>
Failed Uploads: <count>

Test Case to Scenario Mapping
------------------------------
Test Scenario ID | Test Case ID | Test Case Title

Test Data Details
-----------------
[Test Case ID] -> [Key: Value]

Errors (If Any)
---------------
[Test Case ID] → [Error Message]

Final TestRail Suite / Section URL
-----------------------------------
TestRail Suite URL - <URL from tool>
```

**Subtask 2: Requirements Traceability Matrix**

**Purpose:**
Generates a comprehensive mapping showing relationships between:
- Test Scenario IDs
- Acceptance Criteria IDs
- Test Case IDs
- Test Case Descriptions

**Processing:**
- Analyzes provided JSON test cases
- Maps each Test Scenario ID to Acceptance Criteria ID
- Links corresponding Test Case IDs
- Maintains one-to-many relationships
- Avoids duplicates
- Preserves all IDs exactly as provided

**Output 2 Format:**
```
Test Scenario ID | Acceptance Criteria ID | Test Case ID | Test Case Description
-----------------|------------------------|--------------|----------------------
TS-001           | AC-1                   | TC-001       | Verify login functionality
TS-001           | AC-1                   | TC-002       | Verify logout functionality
TS-002           | AC-2                   | TC-003       | Verify search feature
```

**Non-Negotiable Constraints:**
- No JSON output in final response
- No per-test-case URLs
- Exactly one TestRail Suite URL
- Zero tool re-invocations after first response
- Pre-emptive success declaration when outputUrl received
- No comparison of success_count to input count
- Forbidden thought phase after tool response

**Error Handling:**
- Logs upload errors per test case
- Does NOT retry failed uploads
- Reports skipped cases as "Already Existed"
- Graceful handling of duplicate entries

---

## Workflow Sequence

The complete workflow executes in the following sequence:

1. **Agent 1: Extract Jira Issue**
   - Input: Jira Issue Key
   - Output: IssueID + Description (JSON)
   - Next: Pass to Agent 2

2. **Agent 2: Generate Test Scenarios**
   - Input: IssueID + Description from Agent 1
   - Output: JSON array of test scenarios (max 10)
   - Next: Pass to Agent 3

3. **Agent 3: Create Jira Tasks**
   - Input: Test scenarios JSON from Agent 2
   - Output: Jira URLs + subtask_id
   - Next: Pass subtask_id to Agent 4

4. **Agent 4: Retrieve Jira Subtasks**
   - Input: subtask_id from Agent 3
   - Output: Validated test scenarios JSON array
   - Next: Pass to Agent 5

5. **Agent 5: Generate Test Cases**
   - Input: Test scenarios from Agent 4
   - Output: Detailed test cases with steps (10-15 test cases)
   - Next: Pass to Agent 6

6. **Agent 6: Upload to TestRail**
   - Input: Test cases JSON from Agent 5 + project/suite/section IDs
   - Output: Upload summary + Traceability matrix
   - Final: TestRail URL + Complete documentation

---

## Data Flow

### Input Requirements
- **Initial Input:** Jira Issue Key (e.g., PROJ-123)
- **Configuration:** TestRail project_id, suite_id, section_id
- **Knowledge Base:** Application understanding documents, test scenario standards

### Intermediate Data Structures

**After Agent 1:**
```json
{
  "IssueID": "PROJ-123",
  "description": "User story with acceptance criteria..."
}
```

**After Agent 2:**
```json
[
  {
    "test_scenario_id": "TS-001",
    "test_scenario_description": "...",
    "pre_condition": "...",
    "test_data": "...",
    "navigable_path": "...",
    "acceptance_criteria_id": "AC-1",
    "IssueId": "PROJ-123"
  }
]
```

**After Agent 3:**
```json
{
  "outputUrl": ["https://jira.example.com/browse/SCRUM-1234"],
  "subtask_id": "SCRUM-1234"
}
```

**After Agent 4:**
```json
[
  {
    "test_scenario_id": "TS-001",
    "test_scenario_description": "...",
    "pre_condition": "...",
    "test_data": "...",
    "navigable_path": "...",
    "acceptance_criteria_id": "AC-1",
    "IssueId": "HAP-1"
  }
]
```

**After Agent 5:**
```json
{
  "testCaseId": "HAP-123 TS-001 TC-001",
  "testCaseDescription": "...",
  "AcceptanceCriteriaId": "AC-55",
  "IssueId": "HAP-123",
  "testSteps": [...],
  "testScenarioId": "TS-001"
}
```

### Final Outputs

1. **TestRail Upload Summary** (readable format)
2. **Requirements Traceability Matrix** (table format)
3. **TestRail Suite URL** (for accessing uploaded test cases)

---

## Key Features and Benefits

### Automation Benefits
- **End-to-End Automation:** Complete workflow from Jira user story to TestRail test cases
- **Time Savings:** Eliminates manual test case creation and documentation
- **Consistency:** Standardized test scenario and test case formats
- **Traceability:** Full linkage from acceptance criteria through test cases

### Quality Assurance
- **Coverage Validation:** Ensures all acceptance criteria are covered
- **Hallucination Prevention:** Only generates tests based on documented requirements
- **Data Integrity:** Verification step (Agent 4) ensures data accuracy
- **Error Handling:** Graceful handling with logging and feedback

### Integration
- **Jira Integration:** Seamless issue retrieval and task creation
- **TestRail Integration:** Direct upload with proper formatting
- **Knowledge Base:** Leverages existing documentation for context

### Traceability
- **Bidirectional Links:** Test cases linked back to Jira issues
- **Requirements Matrix:** Clear mapping of scenarios to criteria to test cases
- **Audit Trail:** Complete record of test case origin and rationale

---

## Technical Specifications

### API Integrations
- **Jira REST API:** v3
- **TestRail API:** Dynamic upload
- **Base URLs:**
  - Jira: https://aavademo.atlassian.net
  - TestRail: (configured per environment)

### Data Format Standards
- **Primary Format:** JSON
- **Character Encoding:** UTF-8
- **Newline Handling:** Escaped as \\n
- **ID Format:** Hierarchical (IssueId TS-XXX TC-XXX)

### Limits and Constraints
- **Test Scenarios:** Maximum 10 per user story
- **Test Cases:** 10-15 per workflow run
- **Tool Invocations:** Single invocation for TestRail upload
- **Retry Policy:** No automatic retries (except where specified)

### Error Handling
- **Logging:** Comprehensive error logging at each step
- **Validation:** Mandatory coverage validation before proceeding
- **Graceful Degradation:** Reports errors without breaking workflow
- **User Feedback:** Actionable error messages

---

## Workflow Execution Guidelines

### Prerequisites
1. Valid Jira credentials and API access
2. TestRail project, suite, and section IDs
3. Knowledge base with application understanding documents
4. Proper tool configurations and permissions

### Execution Steps
1. Provide Jira issue key as input
2. Configure TestRail parameters (project_id, suite_id, section_id)
3. Initiate workflow
4. Monitor agent progression through 6 stages
5. Receive final outputs (upload summary + traceability matrix)
6. Access TestRail via provided URL to view uploaded test cases

### Best Practices
- Ensure Jira issues have complete acceptance criteria
- Maintain up-to-date application understanding documents
- Review generated test scenarios before proceeding to test case generation
- Verify TestRail upload summary for any failed uploads
- Use traceability matrix for audit and review purposes

---

## Maintenance and Support

### Knowledge Base Updates
- Regularly update application understanding documents
- Maintain test scenario generation standards
- Document new patterns and edge cases

### Tool Monitoring
- Monitor API rate limits (Jira and TestRail)
- Track tool success rates
- Review error logs for patterns

### Continuous Improvement
- Analyze failed uploads for root causes
- Refine test scenario generation rules
- Enhance error handling mechanisms
- Update documentation based on user feedback

---

**Document Version:** 1.0  
**Last Updated:** July 3, 2026  
**Workflow:** SH UserStory to TestCase  
**Total Agents:** 6  
**Integration Points:** Jira, TestRail, Knowledge Base
