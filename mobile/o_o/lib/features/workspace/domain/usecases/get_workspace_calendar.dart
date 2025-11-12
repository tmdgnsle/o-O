import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

import '../../../../core/error/failures.dart';
import '../../../../core/usecases/usecase.dart';
import '../entities/workspace_calendar_entity.dart';
import '../repositories/workspace_repository.dart';

/// Calendar Params
class CalendarParams extends Equatable {
  final String from;
  final String to;

  const CalendarParams({
    required this.from,
    required this.to,
  });

  @override
  List<Object?> get props => [from, to];
}

/// Get Workspace Calendar UseCase
class GetWorkspaceCalendar implements UseCase<List<WorkspaceCalendarEntity>, CalendarParams> {
  final WorkspaceRepository repository;

  GetWorkspaceCalendar(this.repository);

  @override
  Future<Either<Failure, List<WorkspaceCalendarEntity>>> call(CalendarParams params) async {
    return await repository.getCalendar(
      from: params.from,
      to: params.to,
    );
  }
}
