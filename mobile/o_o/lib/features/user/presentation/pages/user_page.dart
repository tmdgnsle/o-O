import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../bloc/user_bloc.dart';
import '../bloc/user_event.dart';
import '../bloc/user_state.dart';

/// Example page showing how to use Freezed states in UI
class UserPage extends StatelessWidget {
  const UserPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('User Management'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              context.read<UserBloc>().add(const UserEvent.refreshUsers());
            },
          ),
        ],
      ),
      body: BlocBuilder<UserBloc, UserState>(
        builder: (context, state) {
          // Freezed의 when 메서드로 모든 상태를 처리
          // 모든 케이스를 처리해야 하므로 타입 안전성이 보장됩니다
          return state.when(
            initial: () => const Center(
              child: Text('Press the button to load users'),
            ),
            loading: () => const Center(
              child: CircularProgressIndicator(),
            ),
            loaded: (user) => Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'User: ${user.name}',
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 8),
                  Text('Email: ${user.email}'),
                  const SizedBox(height: 8),
                  Text('Display Name: ${user.displayName}'),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      // copyWith 사용 예제
                      final updatedUser = user.copyWith(
                        name: '${user.name} (Updated)',
                      );
                      context.read<UserBloc>().add(
                            UserEvent.updateUser(user: updatedUser),
                          );
                    },
                    child: const Text('Update User'),
                  ),
                ],
              ),
            ),
            listLoaded: (users) => ListView.builder(
              itemCount: users.length,
              itemBuilder: (context, index) {
                final user = users[index];
                return ListTile(
                  leading: CircleAvatar(
                    child: Text(user.name[0].toUpperCase()),
                  ),
                  title: Text(user.name),
                  subtitle: Text(user.email),
                  trailing: user.isActive
                      ? const Icon(Icons.check_circle, color: Colors.green)
                      : const Icon(Icons.cancel, color: Colors.grey),
                  onTap: () {
                    context.read<UserBloc>().add(
                          UserEvent.getUser(id: user.id),
                        );
                  },
                );
              },
            ),
            error: (message, errorCode) => Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error, size: 64, color: Colors.red),
                  const SizedBox(height: 16),
                  Text('Error: $message'),
                  if (errorCode != null) Text('Code: $errorCode'),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () {
                      context.read<UserBloc>().add(
                            const UserEvent.getUsers(),
                          );
                    },
                    child: const Text('Retry'),
                  ),
                ],
              ),
            ),
            creating: () => const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text('Creating user...'),
                ],
              ),
            ),
            created: (user) => Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.check_circle, size: 64, color: Colors.green),
                  const SizedBox(height: 16),
                  Text('User created: ${user.name}'),
                ],
              ),
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          context.read<UserBloc>().add(const UserEvent.getUsers());
        },
        child: const Icon(Icons.list),
      ),
    );
  }
}

/// Alternative: Using maybeWhen for partial state handling
class UserPageWithMaybeWhen extends StatelessWidget {
  const UserPageWithMaybeWhen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('User Management')),
      body: BlocBuilder<UserBloc, UserState>(
        builder: (context, state) {
          // maybeWhen: 일부 케이스만 처리하고 나머지는 orElse로 처리
          return state.maybeWhen(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (message, _) => Center(child: Text('Error: $message')),
            // 나머지 모든 상태는 orElse로 처리
            orElse: () => const Center(child: Text('No data')),
          );
        },
      ),
    );
  }
}

/// Alternative: Using map instead of when
class UserPageWithMap extends StatelessWidget {
  const UserPageWithMap({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('User Management')),
      body: BlocBuilder<UserBloc, UserState>(
        builder: (context, state) {
          // map: state 객체 자체에 접근 가능
          return state.map(
            initial: (_) => const Center(child: Text('Initial')),
            loading: (_) => const Center(child: CircularProgressIndicator()),
            loaded: (state) => Center(child: Text(state.user.name)),
            listLoaded: (state) => Text('${state.users.length} users'),
            error: (state) => Center(child: Text(state.message)),
            creating: (_) => const Center(child: Text('Creating...')),
            created: (state) => Center(child: Text(state.user.name)),
          );
        },
      ),
    );
  }
}
