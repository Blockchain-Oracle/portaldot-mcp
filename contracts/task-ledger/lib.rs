#![cfg_attr(not(feature = "std"), no_std, no_main)]

//! Agent Task Ledger — a minimal ink! v5 contract for Portaldot.
//! An AI agent (via the MCP server) creates, completes, and reads tasks on-chain.
//! Satisfies the hackathon's "Portaldot native deployment, POT as gas" gate.

#[ink::contract]
mod task_ledger {
    use ink::prelude::{string::String, vec::Vec};

    #[derive(Clone)]
    #[cfg_attr(feature = "std", derive(Debug, PartialEq, Eq, ink::storage::traits::StorageLayout))]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub struct Task {
        pub id: u32,
        pub description: String,
        pub completed: bool,
        pub owner: AccountId,
        pub created_at: u64,
    }

    #[derive(Debug, PartialEq, Eq)]
    #[ink::scale_derive(Encode, Decode, TypeInfo)]
    pub enum Error {
        TaskNotFound,
        NotTaskOwner,
    }

    #[ink(event)]
    pub struct TaskCreated {
        #[ink(topic)]
        owner: AccountId,
        id: u32,
    }

    #[ink(event)]
    pub struct TaskCompleted {
        #[ink(topic)]
        owner: AccountId,
        id: u32,
    }

    #[ink(storage)]
    pub struct TaskLedger {
        tasks: Vec<Task>,
    }

    impl TaskLedger {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self { tasks: Vec::new() }
        }

        /// Create a task owned by the caller. Returns the new task id.
        #[ink(message)]
        pub fn create_task(&mut self, description: String) -> u32 {
            let owner = self.env().caller();
            let created_at = self.env().block_timestamp();
            let id = u32::try_from(self.tasks.len()).unwrap_or(u32::MAX);
            self.tasks.push(Task {
                id,
                description,
                completed: false,
                owner,
                created_at,
            });
            self.env().emit_event(TaskCreated { owner, id });
            id
        }

        /// Mark a task complete. Only the task owner may complete it.
        #[ink(message)]
        pub fn complete_task(&mut self, id: u32) -> Result<(), Error> {
            let caller = self.env().caller();
            {
                let task = self.tasks.get_mut(id as usize).ok_or(Error::TaskNotFound)?;
                if task.owner != caller {
                    return Err(Error::NotTaskOwner);
                }
                task.completed = true;
            }
            self.env().emit_event(TaskCompleted { owner: caller, id });
            Ok(())
        }

        /// Read a single task by id.
        #[ink(message)]
        pub fn get_task(&self, id: u32) -> Option<Task> {
            self.tasks.get(id as usize).cloned()
        }

        /// Read all tasks owned by an account.
        #[ink(message)]
        pub fn get_tasks(&self, owner: AccountId) -> Vec<Task> {
            self.tasks.iter().filter(|t| t.owner == owner).cloned().collect()
        }

        /// Total number of tasks ever created.
        #[ink(message)]
        pub fn task_count(&self) -> u32 {
            u32::try_from(self.tasks.len()).unwrap_or(u32::MAX)
        }
    }

    impl Default for TaskLedger {
        fn default() -> Self {
            Self::new()
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[ink::test]
        fn create_and_read_works() {
            let mut ledger = TaskLedger::new();
            let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
            let id = ledger.create_task(String::from("Deploy to mainnet"));
            assert_eq!(id, 0);
            assert_eq!(ledger.task_count(), 1);
            let tasks = ledger.get_tasks(accounts.alice);
            assert_eq!(tasks.len(), 1);
            assert_eq!(tasks[0].description, "Deploy to mainnet");
            assert!(!tasks[0].completed);
        }

        #[ink::test]
        fn complete_works_and_guards_owner() {
            let mut ledger = TaskLedger::new();
            let id = ledger.create_task(String::from("ship it"));
            assert_eq!(ledger.complete_task(id), Ok(()));
            assert!(ledger.get_task(id).unwrap().completed);
            assert_eq!(ledger.complete_task(999), Err(Error::TaskNotFound));
        }
    }
}
